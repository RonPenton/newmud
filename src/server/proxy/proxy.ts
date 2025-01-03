import DeepProxy from 'proxy-deep';
//import Decimal from 'decimal.js';
import { UniverseManager } from '../universe/universe';
import {
    ModelStorage,
    ModelName,
    ModelProxy,
    modelRegistrations,
    pluralName,
    PluralName
} from '../models';
import { recordFilter, recordMap } from 'tsc-utils';
import { DbSet, InternalAdd, InternalDelete } from '../db/dbset';
import Decimal from 'decimal.js';
import { isTwoWayLink, ObjectDescriptor } from '../rtti';

export function getProxyObject<T extends ModelName>(
    type: T,
    universe: UniverseManager,
    obj: ModelStorage<T>,
    linkers: (() => void)[]
): ModelProxy<T> {

    const typeDef: ObjectDescriptor = modelRegistrations[type].descriptor;

    const recordDescriptors = recordMap(modelRegistrations, reg => reg.descriptor as ObjectDescriptor);
    const recordsLinkingToThis = Object.keys(recordFilter(recordDescriptors, def => {
        return Object.values(def).some(val => isTwoWayLink(val) && val.modelPointerName === type);
    }));

    const dbSets = recordsLinkingToThis.reduce((acc, name) => {
        acc[pluralName(name as ModelName)] = new DbSet(name as ModelName, type, obj, universe.proxies);
        return acc;
    }, {} as Record<PluralName, DbSet<any>>);

    // add a "linker" function to the global set of linkers that will be executed once
    // all the proxies are created. This has to happen after the proxies are created
    // because I didn't want to create a dependency resolver mechanism, and also someday
    // there may be circular references which would prevent dependency resolution.
    linkers.push(() => {
        // fills the virtual "db set" object with references to this object. 

        // first find all links on this object to other objects.
        const modelLinks = recordFilter(typeDef, (def) => isTwoWayLink(def));

        for (const [key, def] of Object.entries(modelLinks)) {
            // console.log(`Attempting to link ${type}[${obj.id}] to ${key}[${obj[key as keyof typeof obj]}]`);

            // the linked type has a dbset of links back to this object.
            // for example an "actor" has a dbset of "items", and we'll add this item's ID 
            // to that set. 
            const linkedType = def.modelPointerName;
            const linkedId = obj[key as keyof typeof obj];

            if (linkedId === null && def.isNullable === true) {
                continue;
            }
            if (linkedId === undefined && def.isOptional === true) {
                continue;
            }

            if (typeof linkedId !== 'number') {
                throw new Error(`Invalid linked ID for ${type}[${obj.id}].${key}: ${linkedId}`);
            }
            const linkedObj = universe.getRecord(linkedType, linkedId);
            if (linkedObj === undefined) {
                throw new Error(`Could not find linked object ${linkedType}[${linkedId}]`);
            }

            // console.log(`Linking ${type}[${obj.id}] to ${linkedType}[${linkedId}]`);
            let set = linkedObj[pluralName(type)];
            if (!(set instanceof DbSet)) {
                throw new Error(`Invalid DbSet for ${linkedType}[${linkedId}].${pluralName(type)}`);
            } else {
                set[InternalAdd](obj.id);
            }
        }
    });

    function getCorrespondingDbSet(
        modelPointerName: ModelName,
        id: number | undefined | null | { id: number }
    ) {
        if (id === null || id === undefined) {
            return null;
        }

        const val = typeof id === 'number' ? id : id.id;

        const record = universe.getRecord(modelPointerName, val);
        if (!record) {
            throw new Error(`Could not find ${modelPointerName}[${id}]`);
        }
        const setName = pluralName(type);
        const set = record[setName as keyof typeof record] as unknown as DbSet<any>;
        if (!(set instanceof DbSet)) {
            throw new Error(`Invalid DbSet for ${modelPointerName}[${id}].${setName}`);
        }
        return set;
    }

    const proxy = new DeepProxy<ModelProxy<T>>(obj as any, {
        set(target, key, value, receiver) {

            const path = [...this.path, key];
            const pathStr = `${type}[${obj.id}].${path.join('.')}`;
            const def = getTypedef(typeDef, path);

            if(!def) {
                // first see if the most recent descriptor is a "properties" object. 
                const lowestDef = getLowestTypedef(typeDef, path);
                if(!lowestDef || lowestDef.properties !== true) {
                    throw new Error(`Could not find typedef for ${pathStr}`);
                }

                // this is a sub-property of a properties object, which is free-form and
                // not governed by the RTTI system. So we'll allow the change and record it.
                Reflect.set(target, key, value, receiver);
                universe.setDirty(type, obj.id);
                return true;
            }

            if (def.isReadOnly === true) {
                throw new Error(`Cannot set read-only property ${pathStr}`);
            }
            if (value === null && def.isNullable !== true) {
                throw new Error(`Cannot set non-nullable property ${pathStr} to {null}`);
            }
            if (value === undefined && def.isOptional !== true) {
                throw new Error(`Cannot set non-optional property ${pathStr} to {undefined}`);
            }

            //todo: Validate types in the future to ensure correctness. 
            if (def.object !== undefined && typeof def.object !== 'object') {
                throw new Error(`Cannot set property ${pathStr} to a non-object`);
            }

            if (def.modelPointerName !== undefined) {

                const existingVal = Reflect.get(target, key, receiver) as number | null | undefined;
                const existingSet = getCorrespondingDbSet(def.modelPointerName, existingVal);
                const newSet = getCorrespondingDbSet(def.modelPointerName, value);

                if (existingSet !== null && !!existingVal) {
                    existingSet[InternalDelete](obj.id);
                }

                if (value === null) {
                    Reflect.set(target, key, value, receiver);
                }
                else {
                    if (newSet === null) {
                        throw new Error(`Could not find ${def.modelPointerName}[${value}]`);
                    }

                    Reflect.set(target, key, value.id, receiver);
                    console.log(`Adding ${value.id} to set ${newSet}`);
                    newSet[InternalAdd](obj.id);
                }
                universe.setDirty(type, obj.id);
                return true;
            }

            if (value instanceof Decimal) {
                Reflect.set(target, key, value, receiver);
                universe.setDirty(type, obj.id);
                return true;
            }
            else if (typeof value === 'object' && value !== null) {
                Reflect.set(target, key, value, receiver);
                universe.setDirty(type, obj.id);
                return this.nest({}) as any;
            } else {
                console.log(`setting ${pathStr} to ${value}`);
                Reflect.set(target, key, value, receiver);
                universe.setDirty(type, obj.id);
                return true;
            }
        },

        deleteProperty(target, key) {
            const path = [...this.path, key];
            const pathStr = `${type}[${obj.id}].${path.join('.')}`;
            const def = getTypedef(typeDef, path);

            if (def.isReadOnly === true) {
                throw new Error(`Cannot delete read-only property ${pathStr}`);
            }
            if (def.isOptional !== true) {
                throw new Error(`Cannot delete non-optional property ${pathStr}`);
            }

            delete target[key as keyof typeof target];
            universe.setDirty(type, obj.id);
            return true;
        },

        get(target, key, receiver) {
            const path = [...this.path, key];

            const def = getTypedef(typeDef, path);
            if (!def && dbSets[key as PluralName]) {
                // no RTTI def found, but it's an inferred reverse DBSet. 
                return dbSets[key as PluralName];
            }

            const val: any = Reflect.get(target, key, receiver);

            if (def && def.modelPointerName !== undefined) {
                return universe.proxies[def.modelPointerName as ModelName].get(val);
            }

            if (val instanceof Decimal) {
                // decimals are "objects" but not records, so it would be an error to try to
                // nest them.
                return val;
            }
            else if (typeof val === 'object' && val !== null) {
                return this.nest(val);
            } else {
                return val;
            }
        }
    });

    return proxy;
}

function getTypedef(root: ObjectDescriptor | DbObjectDescriptor | FullTypeDescriptor<any>, keys: PropertyKey[]) {
    let obj = root;
    for (const key of keys) {
        if (isObject(obj)) {
            obj = obj.object[String(key)];
        }
        else if (typeof obj === 'object' && obj !== null) {
            obj = obj[String(key) as keyof typeof obj];
        }
    }

    return obj;
}

/**
 * Used in the event that we cannot find an exact typedef for a given path. This 
 * function travels up the key path and tries to find the lowest typedef that
 * exists. 
 * @param root 
 * @param keys 
 * @returns 
 */
function getLowestTypedef(root: ObjectDescriptor | DbObjectDescriptor | FullTypeDescriptor<any>, keys: PropertyKey[]) {

    if(keys.length === 0) {
        return null;
    }

    const def = getTypedef(root, keys);
    if(!def) {
        return getLowestTypedef(root, keys.slice(0, keys.length - 1));
    }
    return def;
}