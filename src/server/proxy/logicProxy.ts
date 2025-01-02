import { UniverseManager } from '../universe/universe';
import { ModelName, ModelStorage } from '../models';
import { LogicModelObject } from '../extensibleLogic/types';
import { allLogicRegistrations } from '../extensibleLogic/Logic';

export function getLogicProxy<T extends ModelName>(
    type: T,
    universe: UniverseManager,
    obj: ModelStorage<T>
): LogicModelObject<T> {

    const proxy = new Proxy<LogicModelObject<T>>(obj as any, {

        get(target, key, _receiver) {
            const sets = allLogicRegistrations.get(type);
            if (!sets) {
                throw new Error(`No logic registration found for ${type}`);
            }
            const set = sets.get(key as string);
            if (!set) {
                throw new Error(`No logic set found for ${String(key)} on ${type}`);
            }

            return (args: any) => {
                const d = set.defaultValue(args);
                return set(universe, target, ...args);
            }

        }
    });

    return proxy;
}
