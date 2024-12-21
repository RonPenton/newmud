import { DescriptorType, WithoutDescriptor } from "../models";
import { ModelName } from "../models/ModelNames";
import { ModelPointer, Nullable, ObjectDescriptor, Optional, ReadOnly, TypeDescriptor } from "./types";

export type IsObject = {
    object: ObjectDescriptor;
}

export const RTTI = {
    id: (): TypeDescriptor<number> & ReadOnly => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        };
    },

    of: <T>(): TypeDescriptor<T> => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    modelPointer: <T extends ModelName>(modelName: T): ModelPointer<T> => {
        return {
            modelPointerName: modelName,
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    optional: <T extends TypeDescriptor<any>>(descriptor: T): T & Optional => {
        return {
            ...descriptor,
            typeDescriptor: () => { throw new Error('not implemented') },
            isOptional: true,
        };
    },

    nullable: <T extends TypeDescriptor<any>>(
        descriptor: T
    ): WithoutDescriptor<T> & TypeDescriptor<DescriptorType<T> | null> & Nullable => {
        return {
            ...descriptor,
            typeDescriptor: () => { throw new Error('not implemented') },
            isNullable: true,
        };
    },

    object: <T extends ObjectDescriptor>(object: T): TypeDescriptor<T> & IsObject => {
        return {
            object,
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    recordOfModel: <K extends string, T extends ModelName>(
        recordKeys: readonly K[],
        modelName: T
    ): TypeDescriptor<Record<K, ModelPointer<T> & Optional>> & IsObject => {

        const object = recordKeys.reduce((acc, key) => {
            acc[key] =RTTI.optional(RTTI.modelPointer(modelName));
            return acc;
        }, {} as Record<K, ModelPointer<T>>);

        return {
            object,
            typeDescriptor: () => { throw new Error('not implemented') },
        }
    }
}
