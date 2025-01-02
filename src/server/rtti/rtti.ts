import { DescriptorType } from "../models";
import { ModelName } from "../models/ModelNames";
import {
    IsObject,
    ModelPointer,
    ObjectDescriptor,
    Optional,
    ReadOnly,
    TemplatedFrom,
    TypeDescriptor
} from "./types";


export const RTTI = {
    id: (): TypeDescriptor<number> & ReadOnly => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        } as const;
    },

    of: <T>() => {
        return rttiChainable({
            typeDescriptor: (): T => { throw new Error('not implemented') },
        });
    },

    modelPointer: <T extends ModelName>(modelName: T) => {
        return rttiChainable({
            modelPointerName: modelName,
            typeDescriptor: (): T => { throw new Error('not implemented') },
        } as const);
    },

    ownedBy: <T extends ModelName>(modelName: T) => {
        return rttiChainable({
            modelPointerName: modelName,
            typeDescriptor: (): T => { throw new Error('not implemented') },
            ownedBy: true,
        } as const);
    },

    templatedFrom: <T extends ModelName>(modelName: T): ModelPointer<T> & TypeDescriptor<T> & TemplatedFrom => {
        return rttiChainable({
            modelPointerName: modelName,
            typeDescriptor: (): T => { throw new Error('not implemented') },
            templatedFrom: true,
        } as const);
    },

    object: <T extends ObjectDescriptor>(object: T): TypeDescriptor<T> & IsObject => {
        return rttiChainable({
            object,
            typeDescriptor: () => { throw new Error('not implemented') },
        });
    },

    partialRecord: <K extends string, T extends TypeDescriptor<any>>(
        recordKeys: readonly K[],
        descriptor: T
    ): TypeDescriptor<Record<K, T & Optional>> & IsObject => {

        const desc = rttiChainable(descriptor).optional();
        const object = recordKeys.reduce((acc, key) => {
            acc[key] = desc;
            return acc;
        }, {} as Record<K, typeof desc>);

        return rttiChainable({
            object,
            typeDescriptor: () => { throw new Error('not implemented') },
        })
    },

    properties: <T extends Record<string, any>>() => {
        return {
            typeDescriptor: (): T => { throw new Error('not implemented') },
            properties: true,
            isReadOnly: true
        } as const;
    },

    logic: <T extends ModelName>(modelName: T) => {
        return {
            modelLogicName: modelName,
            typeDescriptor: (): T => { throw new Error('not implemented') },
            isReadOnly: true
        } as const;
    }
}

export type RTTIChainable<T extends TypeDescriptor<any>> = ReturnType<typeof rttiChainable<T>>;

export function rttiChainable<T extends TypeDescriptor<any>>(
    descriptor: T,
) {
    return {
        ...descriptor,

        readonly: () => {
            return rttiChainable({
                ...descriptor,
                isReadOnly: true,
            } as const);
        },

        optional: () => {
            return rttiChainable({
                ...descriptor,
                isOptional: true,
            } as const);
        },

        nullable: () => {
            const {
                typeDescriptor: _,
                ...rest
            } = descriptor;
            return rttiChainable({
                ...rest,
                typeDescriptor: (): DescriptorType<T> | null => { throw new Error('not implemented') },
                isNullable: true,
            } as const);
        },

        default: <T extends TypeDescriptor<any>>(descriptor: T, defaultValue: DescriptorType<T>): T => {
            return rttiChainable({
                ...descriptor,
                defaultValue,
            } as const);
        }
    }
}
