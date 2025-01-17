import { recordFilter } from "tsc-utils";
import { ModelProxy, ModelRegistration, ModelRegistrations } from "../models";
import { flatten, ModelPointer, ObjectDescriptor, optionalKeys, requiredKeys, Template, TemplatedFrom } from "./rtti";
import { ModelName } from "../models/ModelNames";

export function isTemplate(obj: any): obj is Template {
    return obj && typeof obj ==='object' && obj.isTemplate === true;
}

export type TemplateProperties<T extends ObjectDescriptor> = {
    [K in keyof T as T[K] extends Template ? K : never]: T[K];
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
    return recordFilter(registration.descriptor.object, isTemplate) as any;
}

type A = TemplateParents<'actor'>;
type B = ModelProxy<'race'>;

export function createModelFromTemplate<M extends ModelName>(
    template: TemplateParents<M>,
    model: ModelRegistration<any, M, any>
): ModelRegistration<any, M, any> {
    const descriptor = { ...model.descriptor.object, ...template };
    return {
        ...model,
        descriptor,
    };
}
)