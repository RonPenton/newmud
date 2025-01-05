import { IsObject, ObjectDescriptor, ProxyType, TypeDescriptor } from "../rtti";
import { ModelName } from "./ModelNames";
import { ModelProxy } from "./types";

export type ModelRegistration<
    T extends TypeDescriptor<any, any> & IsObject,
    N extends ModelName,
    P extends string,
> = {
    name: N,
    plural: P,
    descriptor: T;
    onChanges: OnChangeObject<T, T['object']>
}

export const modelRegistrations: Record<ModelName, ModelRegistration<any, ModelName, string>> = {} as any;

export type OnChangeObject<M extends TypeDescriptor<any, any>, T extends ObjectDescriptor> = {
    [K in keyof T]?: (obj: ProxyType<M>, val: ProxyType<T[K]>) => ProxyType<T[K]>;
}

export function registerModel<
    T extends TypeDescriptor<any, any> & IsObject,
    N extends ModelName,
    P extends string
>(
    registration: ModelRegistration<T, N, P>
): ModelRegistration<T, N, P> {
    modelRegistrations[registration.name as ModelName] = registration;
    return registration;
};
