import { Events } from "../events/Events";
import { EventModelObject } from "../events/types";
import path from 'path';

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

export async function loadModelScript<M extends keyof Events>(
    model: M,
    script: string
): Promise<EventModelObject<M> | null> {
    const p = path.resolve(__dirname, `../scripts/${model}/${script}.ts`);
    return await loadScript(p);
}
