//import Decimal from 'decimal.js';
import { StatCollectionProxy, StatCollectionStorage } from '../stats/collection';
import DeepProxy from 'proxy-deep';
import { condenseStats, StatStorage } from '../stats/types';

export function getStatStorageProxy(
    obj: StatCollectionStorage
): StatCollectionProxy {

    const proxy = new DeepProxy<StatCollectionProxy>(obj as any, {

        get(target, key, receiver) {
            if (this.path.length == 0) {
                const val = Reflect.get(target, key, receiver);
                if (!val) {
                    return this.nest({});
                }
                return this.nest(val);
            }
            else if (this.path.length == 1) {
                if(key === Symbol.iterator) {
                    const val = Reflect.get(this.rootTarget, this.path[0]) ?? [];
                    return function*() {
                        for(const k of val) {
                            yield k;
                        }
                    }
                }
                else if(key === 'add') {
                    return (stat: StatStorage) => {
                        const val = Reflect.get(this.rootTarget, this.path[0]) ?? [];
                        Reflect.set(this.rootTarget, this.path[0], condenseStats([...val, stat]));
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
