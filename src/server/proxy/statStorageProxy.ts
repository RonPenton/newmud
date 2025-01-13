import { StatCollectionProxy, StatCollectionStorage } from '../stats/collection';
import DeepProxy from 'proxy-deep';
import { condenseStats, StatModels, StatStorage } from '../stats/types';
import { ModelName } from '../models/ModelNames';
import { ModelProxy } from '../models';
import { StatName } from '../stats/Stats';
import { statCollectors } from '../stats/collectors';

export function getStatStorageProxy<M extends ModelName>(
    type: M,
    record: ModelProxy<M>,
    stats: StatCollectionStorage,
    collection: keyof StatModels[M]
): StatCollectionProxy {

    const proxy = new DeepProxy<StatCollectionProxy>(stats as any, {

        get(target, key, receiver) {
            if (this.path.length == 0) {
                const val = Reflect.get(target, key, receiver);
                if (!val) {
                    return this.nest({});
                }
                return this.nest(val);
            }
            else if (this.path.length == 1) {
                if (key === 'raw') {
                    return (filter?: ModelName) => {
                        const filterFn = (a: StatStorage) => filter ? a.scope == filter : true;
                        const collection = Reflect.get(this.rootTarget, this.path[0]) as StatStorage[] ?? [];
                        return collection.filter(filterFn);
                    }
                }
                else if (key === 'add') {
                    return (stat: StatStorage) => {
                        const val = Reflect.get(this.rootTarget, this.path[0]) ?? [];
                        Reflect.set(this.rootTarget, this.path[0], condenseStats([...val, stat]));
                    }
                }
                else if (key === 'collect') {
                    return (): Iterable<StatStorage> => {
                        const collector = statCollectors[type];
                        return collector({ type, record, collection }, this.path[0] as StatName);
                    }
                }
            }

            throw new Error(`Invalid path for stat proxy: ${this.path}`);
        },

        set(_target, _key, _value, _receiver) {
            // if(this.path.length == 0) {
            //     throw new Error(`Invalid path for stat proxy: ${this.path}`);
            // }
            // if (this.path.length == 1) {
            //     if(!(value instanceof Decimal)) {
            //         throw new Error(`Invalid value for stat proxy: ${value}`);
            //     }

            //     let stat = Reflect.get(this.rootTarget, this.path[0], receiver);
            //     if(!stat) {
            //         // create stat group if it doesn't exist
            //         stat = {};
            //         (this.rootTarget as any)[this.path[0]] = stat;
            //     }

            //     stat[key] = value;
            //     return true;
            // }

            throw new Error(`Invalid path for stat proxy: ${this.path}`);
        }
    });

    return proxy;
}
