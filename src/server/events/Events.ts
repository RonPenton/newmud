import { InferStorageDescriptor, ModelName } from "../models";
import { ObjectDescriptor, TypeDescriptor } from "../rtti/types"

export interface EventsRaw {}

export type EventParameters = ObjectDescriptor;
export type EventReturn = ObjectDescriptor | TypeDescriptor<any>;

export type EventRegistration<
    M extends ModelName,
    N extends string,
    P extends EventParameters,
    R extends EventReturn,
> = {
    model: M,
    name: N,
    parameters: P, 
    result: R,
    defaultValue: () => InferStorageDescriptor<R>
};

export type InferEvent<T extends EventRegistration<any, any, any, any>> = {
    [K in T['name'] as `${T['model']}_${T['name']}`]: T;
};

export const allEventRegistrations: Map<ModelName, Map<string, EventRegistration<any, any, any, any>>> = new Map();

export function registerEvent<
    M extends ModelName,
    N extends string,
    P extends EventParameters,
    R extends EventReturn,
>(
    registration: EventRegistration<M, N, P, R>
): EventRegistration<M, N, P, R> {
    const m = allEventRegistrations.get(registration.model) ?? new Map();
    m.set(registration.name, registration);
    allEventRegistrations.set(registration.model, m);

    return registration;
};


type ExtendsModel<M extends ModelName, T extends string> = T extends `${M}_${infer U}` ? U : never;

type ModelEventsRaw<T extends ModelName> = {
    [K in keyof EventsRaw as ExtendsModel<T, K>]: EventsRaw[K];
}

type AllModelEvents = {
    [K in ModelName]: ModelEventsRaw<K>;
}

export type Events = AllModelEvents;
