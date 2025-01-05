import DeepProxy from 'proxy-deep';
//import Decimal from 'decimal.js';
import { UniverseManager } from '../universe/universe';
import {
    ModelStorage,
    ModelProxy,
    modelRegistrations,
    modelPlural,
    ModelPlural,
} from '../models';
import { recordFilter, recordMap } from 'tsc-utils';
import { DbSet, InternalAdd, InternalDelete } from '../db/dbset';
import Decimal from 'decimal.js';
import { FullTypeDescriptor, isModelLogic, isObject, isOwnedBy, isOwnedCollection, isTwoWayLink, OwnedCollection } from '../rtti';
import { ModelName } from '../models/ModelNames';
import { getLogicProxy } from './logicProxy';

export function getProxyObject<T extends ModelName>(
    type: T,
    universe: UniverseManager,
    obj: ModelStorage<T>,
    linkers: (() => void)[]
): ModelProxy<T> {

    const typeDef: FullTypeDescriptor<any, any> = modelRegistrations[type].descriptor;
    if (!isObject(typeDef)) {
        throw new Error(`Invalid type descriptor for ${type}, must be object.`);
    }

    const setProperties = recordFilter(typeDef.object, def => isOwnedCollection(def));

    // a bit of sanity checking to make sure that the reverse links are set up correctly.
    // TODO: Maybe do this on game engine load instead so this isn't done every time
    // a new proxy is built...
    Object.values(setProperties).forEach(def => verifyOwnedSet(type, def));
    const dbSets = recordMap(setProperties, def => {
        return new DbSet(def.ownedCollection, type, obj, universe.proxies);
    });

    const logic = getLogicProxy(type, obj);

    // add a "linker" function to the global set of linkers that will be executed once
    // all the proxies are created. This has to happen after the proxies are created
    // because I didn't want to create a dependency resolver mechanism, and also someday
    // there may be circular references which would prevent dependency resolution.
    linkers.push(() => {
        // fills the virtual "db set" object with references to this object. 

        // first find all links on this object to other objects.
        const modelLinks = recordFilter(typeDef.object, (def) => isTwoWayLink(def));

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
            const linkedObj: any = universe.getRecord(linkedType, linkedId);
            if (!linkedObj) {
                throw new Error(`Could not find linked object ${linkedType}[${linkedId}]`);
            }

            // console.log(`Linking ${type}[${obj.id}] to ${linkedType}[${linkedId}]`);
            let set = linkedObj[modelPlural(type)];
            if (!(set instanceof DbSet)) {
                throw new Error(`Invalid DbSet for ${linkedType}[${linkedId}].${modelPlural(type)}`);
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
        const setName = modelPlural(type);
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

            if (!def) {
                // first see if the most recent descriptor is a "properties" object. 
                const lowestDef = getLowestTypedef(typeDef, path);
                if (!lowestDef || lowestDef.properties !== true) {
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

            const onChange = modelRegistrations[type].onChanges[key as string];
            if(onChange) {
                value = onChange(proxy, value);
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

            if (def && def.isReadOnly === true) {
                throw new Error(`Cannot delete read-only property ${pathStr}`);
            }
            if (def && def.isOptional !== true) {
                throw new Error(`Cannot delete non-optional property ${pathStr}`);
            }

            delete target[key as keyof typeof target];
            universe.setDirty(type, obj.id);
            return true;
        },

        get(target, key, receiver) {
            const path = [...this.path, key];

            const def = getTypedef(typeDef, path);
            if (def && def.ownedCollection && dbSets[key as ModelPlural]) {
                return dbSets[key as ModelPlural];
            }

            if(def && def.modelLogic) {
                return logic;
            }

            const val: any = Reflect.get(target, key, receiver);

            if (def && def.modelPointerName !== undefined) {
                const ref = universe.proxies[def.modelPointerName as ModelName].get(val);
                if(ref) { return ref };
                if(def.isOptional) { return undefined; }
                if(def.isNullable) { return null; }
                throw new Error(`Could not find ${def.modelPointerName}[${val}]`);
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

function verifyOwnedSet(m: ModelName, def: OwnedCollection<ModelName>) {
    const reg = modelRegistrations[def.ownedCollection].descriptor;
    if (!isObject(reg)) {
        throw new Error(`Invalid type descriptor for ${def.ownedCollection}, must be object.`);
    }
    if (!Object.values(reg.object).some(x => isOwnedBy(x) && x.modelPointerName === m)) {
        throw new Error(`No reverse link found for ${m} in ${def.ownedCollection}`);
    }
}

function getTypedef(root: FullTypeDescriptor<any, any>, keys: PropertyKey[]) {
    let obj: FullTypeDescriptor<any, any> | null = root;
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
function getLowestTypedef(root: FullTypeDescriptor<any, any>, keys: PropertyKey[]) {

    if (keys.length === 0) {
        return null;
    }

    const def = getTypedef(root, keys);
    if (!def) {
        return getLowestTypedef(root, keys.slice(0, keys.length - 1));
    }
    return def;
}