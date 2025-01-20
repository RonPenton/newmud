import { recordFilter, recordMap } from "tsc-utils";
import { ModelProxy, ModelRegistration, ModelRegistrations, ModelStorage } from "../models";
import { flatten, ModelPointer, ObjectDescriptor, optionalKeys, OptionalStorage, requiredKeys, RTTI, Template, TemplatedFrom } from "./rtti";
import { ModelName } from "../models/ModelNames";

export function isTemplate(obj: any): obj is Template {
    return obj && typeof obj === 'object' && obj.isTemplate === true;
}

export type TemplateProperties<T extends ObjectDescriptor> = {
    [K in keyof T as T[K] extends Template ? K : never]: T[K] & OptionalStorage;
}

type ModelTemplate<M extends ModelName> = TemplatedFrom & ModelPointer<M>;

type Parents<T extends ObjectDescriptor> = flatten<{
    [K in requiredKeys<T> as T[K] extends ModelTemplate<any> ? K : never]: T[K] extends ModelTemplate<infer M> ? ModelProxy<M> : never;
} & {
    [K in optionalKeys<T> as T[K] extends ModelTemplate<any> ? K : never]?: T[K] extends ModelTemplate<infer M> ? ModelProxy<M> : never;
}>

export type TemplateParents<M extends ModelName> = Parents<ModelRegistrations[M]['descriptor']['object']>;

export function getTemplateProperties<T extends ModelRegistration<any, any, any>>(
    registration: T
): TemplateProperties<T['descriptor']['object']> {
    return recordMap(
        recordFilter(registration.descriptor.object, isTemplate),
        x => RTTI.optionalStorage(x as any)
    ) as any;
}
