import { InferProxyObject, InferStorageDescriptor } from "../models";
import { EventParameters, EventRegistration, EventReturn, Events } from "./Events";


export type FunctionType<P extends EventParameters, R extends EventReturn> =
    (params: InferProxyObject<P>, aggregate: InferStorageDescriptor<R>) => InferStorageDescriptor<R>;

type Filter<T> = T extends EventRegistration<any, any, infer P, infer R> ? FunctionType<P, R> : never;

export type EventModelObject<M extends keyof Events> = {
    [K in keyof Events[M]]: Filter<Events[M][K]>;
}

export function makeScript<M extends keyof Events>(_model: M, obj: Partial<EventModelObject<M>>): Partial<EventModelObject<M>> {
    return obj;
}
