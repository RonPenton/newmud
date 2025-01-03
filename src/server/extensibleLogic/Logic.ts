import { InferModelProxy, ModelName } from "../models";
import { TypeDescriptor } from "../rtti";
import {  } from "../rtti/types"

export interface LogicRaw {}

export type LogicParameters = TypeDescriptor<any, any>;
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
    result: R,
    defaultValue: (params: InferModelProxy<P>) => InferModelProxy<R>
};

export type InferLogic<T extends LogicRegistration<any, any, any, any>> = {
    [K in T['name'] as `${T['model']}_${T['name']}`]: T;
};

export const allLogicRegistrations: Map<ModelName, Map<string, LogicRegistration<any, any, any, any>>> = new Map();

export function registerLogic<
    M extends ModelName,
    N extends string,
    P extends LogicParameters,
    R extends LogicReturn,
>(
    registration: LogicRegistration<M, N, P, R>
) {
    const m = allLogicRegistrations.get(registration.model) ?? new Map();
    m.set(registration.name, registration);
    allLogicRegistrations.set(registration.model, m);

    return registration;
};

type ExtendsModel<M extends ModelName, T extends string> = T extends `${M}_${infer U}` ? U : never;

type ModelLogicRaw<T extends ModelName> = {
    [K in keyof LogicRaw as ExtendsModel<T, K>]: LogicRaw[K];
}

type AllModelLogic = {
    [K in ModelName]: ModelLogicRaw<K>;
}

export type Logic = AllModelLogic;
