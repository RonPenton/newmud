import path from 'path';
import { ModelName } from "../models";
import { LogicModelObject } from '../extensibleLogic/types';

let _scriptLibrary: Map<string, any> = new Map();

export async function loadScript(location: string, reload = false): Promise<any> {

    if (!reload && _scriptLibrary.has(location)) {
        return _scriptLibrary.get(location);
    }

    if (reload === true) {
        // forcing a reload, so delete the old script from the require cache.
        delete require.cache[require.resolve(location)]
    }

    const module = await import(location);
    if (!module) {
        console.log(`Script not found: ${location}`);
        return null;
    }

    const script = module.script;
    if (!script) {
        console.log(`Script malformed: ${location}`);
        return null;
    }

    _scriptLibrary.set(location, script);
    return script;
}

function modelScriptName(model: ModelName, script: string) {
    return path.resolve(__dirname, `../scripts/${model}/${script}.ts`);
}

export async function loadModelScript<M extends ModelName>(
    model: M,
    script: string
): Promise<Partial<LogicModelObject<M>> | null> {
    return await loadScript(modelScriptName(model, script));
}

export function getModelScript(model: ModelName, script: string): Partial<LogicModelObject<ModelName>> {
    const val = _scriptLibrary.get(modelScriptName(model, script));
    if (!val) {
        console.log(`Script not found: ${model}::${script}`);
        return {};
    }
    return val;
}