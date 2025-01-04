import { TypeDescriptor } from "../rtti";
import { ModelName } from "./ModelNames";

export type ModelRegistration<
    T extends TypeDescriptor<any, any>,
    N extends ModelName,
    P extends string,
> = {
    name: N,
    plural: P,
    descriptor: T;
}

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
