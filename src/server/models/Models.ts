import { DbObjectDescriptor } from "../rtti/types";
import { ModelName, ModelNameRegistration } from "./ModelNames";

export interface Models { }

export type ModelRegistration<
    T extends DbObjectDescriptor,
    N extends string,
    P extends string,
> = ModelNameRegistration<N, P> & {
    descriptor: T;
}

// Helper type to infer the models dynamically
export type InferModel<T extends ModelRegistration<any, any, any>> = {
    [K in T['name']]: T;
};

/**
 * An array of all model names in the game.
 */
export const allModelNames: ModelName[] = [];

export const modelRegistrations: Record<ModelName, ModelRegistration<any, string, string>> = {} as any;

export function registerModel<
    T extends DbObjectDescriptor,
    N extends string,
    P extends string
>(
    registration: ModelRegistration<T, N, P>
): ModelRegistration<T, N, P> {
    modelRegistrations[registration.name as ModelName] = registration;
    allModelNames.push(registration.name as ModelName);
    return registration;
};
