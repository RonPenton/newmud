import { RTTI, TypeDescriptor } from "../rtti";
import { ModelName, ModelNameRegistration } from "./ModelNames";

export const defaultModelProperties = {
    id: RTTI.id(),
    name: RTTI.of<string>(),
    logic: RTTI.logic()
} satisfies Record<string, TypeDescriptor<any, any>>;

export type DefaultModelProperties = typeof defaultModelProperties;

export type DbObjectDescriptorInput = Omit<Record<string, TypeDescriptor<any, any>>, keyof DefaultModelProperties>;

export type DbObjectDescriptor = DefaultModelProperties & DbObjectDescriptorInput;

export interface Models { };

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
    T extends DbObjectDescriptorInput,
    N extends string,
    P extends string
>(
    name: ModelNameRegistration<N, P>,
    descriptor: T
): ModelRegistration<T & DefaultModelProperties, N, P> {
    const registration = {
        ...name,
        descriptor: {
            ...defaultModelProperties,
            ...descriptor
        }
    };
    modelRegistrations[registration.name as ModelName] = registration;
    allModelNames.push(registration.name as ModelName);
    return registration;
};
