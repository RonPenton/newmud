import { DescriptorType, WithoutDescriptor } from "../models";
import { ModelName } from "../models/ModelNames";
import {
    IsObject,
    ModelPointer,
    Nullable,
    ObjectDescriptor,
    Optional,
    ReadOnly,
    TypeDescriptor
} from "./types";


export const RTTI = {
    id: (): TypeDescriptor<number> & ReadOnly => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        };
    },

    readonly: <T extends TypeDescriptor<any>>(descriptor: T): T & ReadOnly => {
        return {
            ...descriptor,
            isReadOnly: true,
        };
    },

    of: <T>(): TypeDescriptor<T> => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    modelPointer: <T extends ModelName>(modelName: T): ModelPointer<T> & TypeDescriptor<T> => {
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

    partialRecord: <K extends string, T extends TypeDescriptor<any>>(
        recordKeys: readonly K[],
        descriptor: T
    ): TypeDescriptor<Record<K, T & Optional>> & IsObject => {

        const desc = RTTI.optional(descriptor);
        const object = recordKeys.reduce((acc, key) => {
            acc[key] = desc;
            return acc;
        }, {} as Record<K, T & Optional>);

        return {
            object,
            typeDescriptor: () => { throw new Error('not implemented') },
        }
    },

    default: <T extends TypeDescriptor<any>>(descriptor: T, defaultValue: DescriptorType<T>): T => {
        return {
            ...descriptor,
            defaultValue,
        };
    }
}
