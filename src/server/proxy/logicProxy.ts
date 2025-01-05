import { ModelStorage } from '../models';
import { LogicModelObject } from '../extensibleLogic/types';
import { allLogicRegistrations, logicDefaults } from '../extensibleLogic/Logic';
import { getModelScript } from '../scriptEngine/loadScript';
import { ModelName } from '../models/ModelNames';

export function getLogicProxy<T extends ModelName>(
    type: T,
    obj: ModelStorage<ModelName>
): LogicModelObject<T> {

    const proxy = new Proxy<LogicModelObject<T>>(obj as any, {

        get(_target, key, _receiver) {
            const sets = allLogicRegistrations.get(type);
            if (!sets) {
                throw new Error(`No logic registration found for ${type}`);
            }
            const set = sets.get(key as string);
            if (!set) {
                throw new Error(`No logic set found for ${String(key)} on ${type}`);
            }
            const defaultValue = logicDefaults.get(type)?.get(key as string)!;

            const scripts = obj.logic.map(l => getModelScript(type, l.name));
            return (args: any) => {
                let d = defaultValue(args);
                for(const script of scripts) {
                    if(key in script) {
                        d = (script as any)[key](args, d);
                    }
                }

                return d;
            }
        }
    });

    return proxy;
}
