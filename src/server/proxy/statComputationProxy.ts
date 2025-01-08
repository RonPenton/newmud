import { StatCollectionComputed } from '../stats/collection';
import DeepProxy from 'proxy-deep';
import { ModelName } from '../models/ModelNames';
import { ModelProxy } from '../models';
import { statComputations } from '../stats/collectors';

export function getStatComputationProxy<M extends ModelName>(
    type: M,
    obj: ModelProxy<M>
): StatCollectionComputed {


    const computer = statComputations[type];
    if (!computer) {
        throw new Error(`No stat computation for type ${type}`);
    }
    const proxy = new DeepProxy<StatCollectionComputed>(obj as any, {

        get(_target, key) {
            return computer(obj, key as keyof StatCollectionComputed);
        },

        set() {
            throw new Error(`Not supported`);
        }
    });

    return proxy;
}
