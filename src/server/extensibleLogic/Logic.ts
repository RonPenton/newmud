import { ModelName } from "../models/ModelNames";
import { IsObject, ProxyType, TypeDescriptor } from "../rtti";
import { LogicDefaultParamters } from "./types";

export interface LogicRaw { }

export type LogicParameters = TypeDescriptor<any, any> & IsObject;
export type LogicReturn = TypeDescriptor<any, any>;

export type LogicRegistration<
    M extends ModelName,
    N extends string,
    P extends LogicParameters,
    R extends LogicReturn,
> = {
    model: M,
    name: N,
    parameters: P,
    result: R
};

export type DefaultLogicFunction<
    M extends ModelName,
    P extends TypeDescriptor<any, any>,
    R extends TypeDescriptor<any, any>
> = (params: ProxyType<P> & LogicDefaultParamters<M>) => ProxyType<R>;

export type InferLogic<T extends LogicRegistration<any, any, any, any>> = {
    [K in T['name']as `${T['model']}_${T['name']}`]: T;
};

export const allLogicRegistrations: Map<ModelName, Map<string, LogicRegistration<any, any, any, any>>> = new Map();
export const logicDefaults: Map<ModelName, Map<string, DefaultLogicFunction<any, any, any>>> = new Map();

export function registerLogic<
    M extends ModelName,
    N extends string,
    P extends LogicParameters,
    R extends LogicReturn,
>(
    registration: LogicRegistration<M, N, P, R>,
) {
    const m = allLogicRegistrations.get(registration.model) ?? new Map();
    m.set(registration.name, registration);
    allLogicRegistrations.set(registration.model, m);
    return registration;
};

export function registerLogicDefault<
    M extends ModelName,
    N extends string,
    P extends LogicParameters,
    R extends LogicReturn,
>(
    registration: LogicRegistration<M, N, P, R>,
    defaultValue: DefaultLogicFunction<M, P, R>
) {
    const m = logicDefaults.get(registration.model) ?? new Map();
    m.set(registration.name, defaultValue);
    logicDefaults.set(registration.model, m);
};

type ExtendsModel<M extends ModelName, T extends string> = T extends `${M}_${infer U}` ? U : never;

type ModelLogicRaw<T extends ModelName> = {
    [K in keyof LogicRaw as ExtendsModel<T, K>]: LogicRaw[K];
}

type AllModelLogic = {
    [K in ModelName]: ModelLogicRaw<K>;
}

export type Logic = AllModelLogic;
