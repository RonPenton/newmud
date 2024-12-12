import { Models } from './Models';

/**
 * Base type for a model, declares all properties shared by all models.
 */
export type ModelType = {
    id: number;
}

/**
 * A type that represents a model registration, which includes the model type,
 * the name of the model, the plural name of the model. 
 */
export type ModelRegistration<T extends ModelType, N extends string, P extends string> = {
    name: N;
    plural: P;
    invariant: (model: T) => boolean;
} 
// & OnChange<T>;

export type ModelTypeOutput<
    T extends ModelType,
    N extends string,
    P extends string
> = ModelRegistration<T, N, P> & {
    model: T;
};

// Helper type to infer the models dynamically
export type InferModel<T extends ModelTypeOutput<any, any, any>> = {
    [K in T['name']]: T;
};

/**
 * A type representing the code names of each model in the game.
 */
export type ModelName = keyof Models;

/**
 * An array of all model names in the game.
 */
export const modelNames: ModelName[] = [];

export const modelRegistrations: Record<ModelName, ModelRegistration<any, string, string>> = {} as any;

export function registerModel<T extends ModelType>() {
    return function <N extends string, P extends string>(
        registration: ModelRegistration<T, N, P>
    ): ModelTypeOutput<T, N, P> {
        modelRegistrations[registration.name as ModelName] = registration;
        modelNames.push(registration.name as ModelName);
        return registration as any; // a little hack never hurt anybody ;)
    };
}


export type Storage<T extends ModelName> = Models[T]['model'];
export type ModelPlural<T extends ModelName> = Models[T]['plural'];

/**
 * A type that represents "onChange" events for a given object.
 */
// export type OnChange<T> = {
//     [K in keyof T as `on${Capitalize<string & K>}Change`]?: (obj: T, value: T[K]) => void;
// }

/**
 * A type that gets the names of all properties that map to a parent resource,
 * following the convention `${ModelName}Id`.
 */
export type ReferenceIdProperties<T extends ModelName> = {
    [K in keyof Storage<T> as K extends `${ModelName}Id` ? K : never]: Storage<T>[K];
};
