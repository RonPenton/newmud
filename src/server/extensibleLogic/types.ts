import { ModelProxy } from "../models";
import { ModelName } from "../models/ModelNames";
import { ProxyType } from "../rtti";
import { UniverseManager } from "../universe/universe";
import { Logic, LogicParameters, LogicRegistration, LogicReturn } from "./Logic";

export type LogicDefaultParamters<M extends ModelName> = {
    [K in M]: ModelProxy<M>;
} & {
    universe: UniverseManager;
}

type LogicFunctionType<P extends LogicParameters, R extends LogicReturn> =
    (params: ProxyType<P>) => ProxyType<R>;

type LogicFunctionImplementation<M extends ModelName, P extends LogicParameters, R extends LogicReturn> =
    (params: ProxyType<P> & LogicDefaultParamters<M>, aggregate: ProxyType<R>) => ProxyType<R>;

type LogicFunctionTypeForRegistration<T> = T extends LogicRegistration<any, any, infer P, infer R>
    ? LogicFunctionType<P, R>
    : never;

type LogicFunctionImplementationForRegistration<T> = T extends LogicRegistration<infer M, any, infer P, infer R>
    ? LogicFunctionImplementation<M, P, R>
    : never;

export type LogicModelObject<M extends ModelName> = {
    [K in keyof Logic[M]]: LogicFunctionTypeForRegistration<Logic[M][K]>;
}

export type LogicModelImplementation<M extends ModelName> = {
    [K in keyof Logic[M]]?: LogicFunctionImplementationForRegistration<Logic[M][K]>;
}

export function makeScript<M extends ModelName>(
    _model: M,
    obj: LogicModelImplementation<M>
): LogicModelImplementation<M> {
    return obj;
}
