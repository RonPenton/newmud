import { TypeDescriptor } from "../rtti/types";
import { ModelName } from "./ModelNames";

export interface Models {}

export type ModelDescriptor = Record<string, TypeDescriptor<any>>;

export type ModelRegistration<
    T extends ModelDescriptor,
    N extends string,
    P extends string,
    DB extends boolean
> = {
    name: N;
    plural: P;
    descriptor: T;
    isDatabaseModel: DB;
}

// Helper type to infer the models dynamically
export type InferModel<T extends ModelRegistration<any, any, any, any>> = {
    [K in T['name']]: T;
};

/**
 * An array of all model names in the game.
 */
export const allModelNames: ModelName[] = [];
export const dbModelNames: ModelName[] = [];

export const modelRegistrations: Record<ModelName, ModelRegistration<any, string, string, boolean>> = {} as any;

export function registerModel<
    T extends ModelDescriptor,
    N extends string,
    P extends string,
    DB extends boolean
>(
    registration: ModelRegistration<T, N, P, DB>
): ModelRegistration<T, N, P, DB> {
    modelRegistrations[registration.name as ModelName] = registration;
    allModelNames.push(registration.name as ModelName);
    if (registration.isDatabaseModel) {
        dbModelNames.push(registration.name as ModelName);
    }
    return registration;
}
