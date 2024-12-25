import DeepProxy from 'proxy-deep';
//import Decimal from 'decimal.js';
import { UniverseManager, UniverseStorage } from '../universe/universe';
import { Storage, ModelName, ModelProxy, modelRegistrations, loadModelFiles, pluralName, PluralName } from '../models';
import {
    DbObjectDescriptor,
    FullTypeDescriptor,
    isModelPointer,
    isObject,
    ObjectDescriptor
} from '../rtti/types';
import { recordFilter, recordMap } from 'tsc-utils';
import { DbSet, InternalAdd, InternalDelete } from '../db/dbset';
import Decimal from 'decimal.js';

export function getProxyObject<T extends ModelName>(
    type: T,
    universe: UniverseManager,
    obj: Storage<T>,
    linkers: (() => void)[]
): ModelProxy<T> {

    const typeDef: ObjectDescriptor = modelRegistrations[type].descriptor;

    const recordDescriptors = recordMap(modelRegistrations, reg => reg.descriptor as ObjectDescriptor);
    const recordsLinkingToThis = Object.keys(recordFilter(recordDescriptors, def => {
        return Object.values(def).some(val => isModelPointer(val) && val.modelPointerName === type);
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
        const modelLinks = recordFilter(typeDef, (def) => isModelPointer(def));

        for (const [key, def] of Object.entries(modelLinks)) {
            console.log(`Attempting to link ${type}[${obj.id}] to ${key}[${obj[key as keyof typeof obj]}]`);

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

            console.log(`Linking ${type}[${obj.id}] to ${linkedType}[${linkedId}]`);
            let set = linkedObj[pluralName(type)];
            if (!(set instanceof DbSet)) {
                console.log(linkedObj);
                console.log(set);
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

    return new DeepProxy<ModelProxy<T>>(obj as any, {
        set(target, key, value, receiver) {

            const path = [...this.path, key];
            const pathStr = `${type}[${obj.id}].${path.join('.')}`;
            const def = getTypedef(typeDef, path);

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
                //console.log(`Getting dbset ${String(key)}`);
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
}

function getTypedef(root: ObjectDescriptor | DbObjectDescriptor | FullTypeDescriptor<any>, keys: PropertyKey[]) {
    let obj = root;
    for (const key of keys) {
        // console.log(`obj: ${JSON.stringify(obj)}`);
        // console.log(`key: ${String(key)}`);

        if (isObject(obj)) {
            obj = obj.object[String(key)];
        }
        else if (typeof obj === 'object' && obj !== null) {
            obj = obj[String(key) as keyof typeof obj];
        }
    }

    return obj;
}

async function go() {

    await loadModelFiles();

    const us: UniverseStorage = {
        actor: [{
            id: 1,
            name: 'actor 1',
            room: 1,
            obj: {
                x: 1,
                y: 2,
                z: 3,
                sub: {
                    a: 4,
                    b: 5,
                    c: 6
                }
            }
        },
        {
            id: 2,
            name: 'actor 2',
            room: 1,
            obj: {
                x: 1,
                y: 2,
                z: 3,
                sub: {
                    a: 4,
                    b: 5,
                    c: 6
                }
            }

        }],
        item: [
            {
                id: 1,
                name: 'test item',
                actor: 1,
                room: null,
                cost: new Decimal(10)
            }
        ],
        room: [{
            id: 1,
            name: 'test room',
            exits: {}
        }],
        portal: []
    };

    const um = new UniverseManager(us);

    const x = um.getRecord('actor', 1);

    if (x) {
        console.log(x.name);

        x.items.forEach(item => { console.log(item.name); });
    }

    console.log(um.getDirtyObjects());
    const item = um.getRecord('item', 1);
    const actor2 = um.getRecord('actor', 2);
    if (item && actor2) {
        console.log(um.getDirtyObjects());
        console.log(`item name: ${item.name}`);
        console.log(`item cost: ᚱ${item.cost}`);
        console.log(`item owner name: ${item.actor?.name}`);

        //item.actor = actor2;
        item.cost = new Decimal(20);
        console.log(`item owner name: ${item.actor?.name}`);
        console.log(`item cost: ᚱ${item.cost}`);
        console.log(um.getDirtyObjects());
    }


}

//void go();
