import DeepProxy from 'proxy-deep';
import Decimal from 'decimal.js';
import { ModelName } from '../models/ModelNames';
import { DbSet } from '../db/dbset';
import { UniverseManager } from '../universe/universe';
import { ModelProxy, Storage } from '../models';

export function getProxyObject<T extends ModelName>(
    type: T, 
    universe: UniverseManager, 
    obj: Storage<T>
): ModelProxy<T> {

    return new DeepProxy<ModelProxy<T>>(obj as any, {
        set(target, key, value, receiver) {

            if (key === UnderlyingObject || key == SetupLinkSets) {
                throw new Error('You cannot set this value.');
            }


            if (value instanceof Decimal) {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return value;
            }
            // Setting a link proxy for a linked table. 
            else if (this.rootTarget == target && isTableLink(key)) {

                const oldValue = Reflect.get(target, key, receiver);

                if (value === null) {
                    Reflect.set(target, key, null, receiver);

                    // Remove the object from the old container. 
                    if (oldValue && typeof oldValue === 'number') {
                        const linkedObject: any = world.get(TableLinkMap[key], oldValue);
                        const set: DbSet<Table> = linkedObject[type];
                        set[InternalDelete](target.id);
                    }

                    world.setDirty(type, obj.id);
                    return true;
                }
                else if ('id' in value && typeof value.id === 'number') {
                    Reflect.set(target, key, value.id, receiver);

                    // Remove the object from the old container. 
                    if (oldValue && typeof oldValue === 'number') {
                        const linkedObject: any = world.get(TableLinkMap[key], oldValue);
                        const set: DbSet<Table> = linkedObject[type];
                        set[InternalDelete](target.id);
                    }

                    // add the object to the new container. 
                    const linkedObject: any = world.get(TableLinkMap[key], value.id);
                    const set: DbSet<Table> = linkedObject[type];
                    set[InternalAdd](target.id);

                    world.setDirty(type, obj.id);
                    return true;
                }

                throw new Error('Invalid set attempt');
            }
            else if (Array.isArray(target) && key == 'length') {
                Reflect.set(target, key, value, receiver);
                return value;
            }
            else if (typeof value === 'object' && value !== null) {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return this.nest({})
            } else {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return true;
            }
        },

        get(target, key, receiver) {

            if (key == UnderlyingObject) {
                return obj;
            }
            if (key == SetupLinkSets) {
                return () => {
                    const o: any = obj;
                    const links = Object.keys(o).filter(isTableLink);
                    for (const link of links) {
                        const otherTable = TableLinkMap[link];
                        const id: number | null = o[link];
                        if (id !== null) {
                            const other: Record<T, DbSet<any>> = world.get(otherTable, id) as any;
                            other[type][InternalAdd](target);
                        }
                    }
                }
            }
            if (key == 'events') {
                return eventsProxy;
            }

            const value: any = Reflect.get(target, key, receiver);

            //const lastPath = this.path[this.path.length - 1];

            // referencing a table link set. Conjure it up from the hidden storage. 
            if (this.rootTarget == target && isTable(key)) {
                const set = getSet(key, sets, world);
                return set;
            }
            // referencing a table link. 
            else if (this.rootTarget == target && isTableLink(key)) {
                if (value === null) {
                    return value;
                }
                else if (typeof value === 'number') {
                    const proxy = world.get(TableLinkMap[key], value);
                    return proxy;
                }

                throw new Error('Invalid get???');
            }
            else if (value instanceof Decimal) {
                return value;
            }
            else if (typeof value === 'object' && value !== null) {
                return this.nest(value)
            }

            return value;
        }
    });
}