import { ModelName } from "../models";

export type Descriptor<T> = {
    typeDescriptor: () => T;
}

type ModelReference<T extends ModelName> = {
    models: readonly T[];
    typeDescriptor: () => T[];
}


export function modelReference<T extends ModelName>(models: T[] | T): ModelReference<T> {
    return {
        models: Array.isArray(models) ? models : [models],
    };
}

let x = {
    actor: 
}