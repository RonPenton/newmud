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
import { DbSet, InternalAdd } from '../db/dbset';

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

    // console.log(`records linking to ${type}: ${recordsLinkingToThis}`);

    const dbSets = recordsLinkingToThis.reduce((acc, name) => {
        acc[pluralName(name as ModelName)] = new DbSet(name as ModelName, universe.proxies);
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
                throw new Error(`Invalid linked ID for ${type}[${obj.id}].${key}`);
            }
            const linkedObj = universe.getRecord(linkedType, linkedId);
            if (linkedObj === undefined) {
                throw new Error(`Could not find linked object ${linkedType}[${linkedId}]`);
            }
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

            // if (value instanceof Decimal) {
            //     Reflect.set(target, key, value, receiver);
            //     universe.changesets[type].add(obj.id);
            //     return value;
            // }
            if (typeof value === 'object' && value !== null) {
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
            return true;
        },

        get(target, key, receiver) {
            const path = [...this.path, key];

            const def = getTypedef(typeDef, path);
            if (!def && dbSets[key as PluralName]) {
                return dbSets[key as PluralName];
            }

            //console.log(`path: ${path}`);

            const val: any = Reflect.get(target, key, receiver);

            if (typeof val === 'object' && val !== null) {
                return this.nest(val);
            } else {
                console.log(`getting ${type}[${obj.id}].${path.join('.')} = ${val}`);
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

// function getModelsLinkingTo


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
                actor: 1
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

    const item = um.getRecord('item', 1);
    const actor2 = um.getRecord('actor', 2);
    if (item && actor2) {
        console.log(`item name: ${item.name}`);
        console.log(`item owner name: ${item.actor?.name}`);

        item.actor = actor2;
        console.log(`item owner name: ${item.actor?.name}`);
    }


}

void go();
