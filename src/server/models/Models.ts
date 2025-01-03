// import { RTTI, TypeDescriptor } from "../rtti";
// import { ModelName, ModelNameRegistration } from "./ModelNames";

import { TypeDescriptor } from "../rtti";
import { ModelName } from "./ModelNames";

// export const defaultModelProperties = {
//     id: RTTI.id(),
//     name: RTTI.of<string>(),
//     logic: RTTI.logic()
// } satisfies Record<string, TypeDescriptor<any, any>>;

// export type DefaultModelProperties = typeof defaultModelProperties;

// export type DbObjectDescriptorInput = Omit<Record<string, TypeDescriptor<any, any>>, keyof DefaultModelProperties>;

// export type DbObjectDescriptor = DefaultModelProperties & DbObjectDescriptorInput;

// export interface Models { };

export type ModelRegistration<
    T extends TypeDescriptor<any, any>,
    N extends ModelName,
    P extends string,
> = {
    name: N,
    plural: P,
    descriptor: T;
}

// // Helper type to infer the models dynamically
// export type InferModel<T extends ModelRegistration<any, any, any>> = {
//     [K in T['name']]: T;
// };

export const modelRegistrations: Record<ModelName, ModelRegistration<any, ModelName, string>> = {} as any;

export function registerModel<
    T extends TypeDescriptor<any, any>,
    N extends ModelName,
    P extends string
>(
    registration: ModelRegistration<T, N, P>
): ModelRegistration<T, N, P> {
    modelRegistrations[registration.name as ModelName] = registration;
    return registration;
};
