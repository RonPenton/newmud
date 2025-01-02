import { InferProxyObject, InferStorageDescriptor, ModelName } from "../models";
import { Logic, LogicParameters, LogicRegistration, LogicReturn } from "./Logic";


type FunctionType<P extends LogicParameters, R extends LogicReturn> =
    (params: InferProxyObject<P>, aggregate: InferStorageDescriptor<R>) => InferStorageDescriptor<R>;

type FunctionTypeForRegistration<T> = T extends LogicRegistration<any, any, infer P, infer R>
    ? FunctionType<P, R>
    : never;

export type LogicModelObject<M extends ModelName> = {
    [K in keyof Logic[M]]: FunctionTypeForRegistration<Logic[M][K]>;
}

export function makeScript<M extends ModelName>(
    _model: M,
    obj: Partial<LogicModelObject<M>>
): Partial<LogicModelObject<M>> {
    return obj;
}
