import { ModelName } from "../models/ModelNames";
import { ModelProxy } from "../models";
import { LogicModelObject } from "../extensibleLogic/types";
import { DbSet } from "../db/dbset";
import { StatCollectionComputed, StatCollectionProxy, StatCollectionStorage } from "../stats/collection";

export type TypeDescriptor<T, U> = {
    storageDescriptor: () => T;
    proxyDescriptor: () => U;
    defaultValue?: T;
}

export type Coalesce<T extends Record<string, any>, U extends Record<string, any>> = flatten<Omit<T, keyof U> & U>;

export type StorageType<T extends TypeDescriptor<any, any>> = T extends TypeDescriptor<infer U, any> ? U : never;
export type ProxyType<T extends TypeDescriptor<any, any>> = T extends TypeDescriptor<any, infer U> ? U : never;

export type identity<T> = T;
export type flatten<T> = T extends Record<string, any> ? identity<{ [k in keyof T]: T[k] }> : T;

export type optionalKeys<T extends object> = { [k in keyof T]: T[k] extends Optional ? k : never; }[keyof T];
export type requiredKeys<T extends Record<string, TypeDescriptor<any, any>>> = {
    [k in keyof T]: T[k] extends Optional ? never : StorageType<T[k]> extends never ? never : k;
}[keyof T];

export type optionalReadOnlyKeys<T extends object> = {
    [k in keyof T]: T[k] extends ReadOnly ? T[k] extends Optional ? k : never : never;
}[keyof T];
export type requiredReadOnlyKeys<T extends object> = {
    [k in keyof T]: T[k] extends ReadOnly ? T[k] extends Optional ? never : k : never;
}[keyof T];
export type optionalMutableKeys<T extends object> = {
    [k in keyof T]: T[k] extends ReadOnly ? never : T[k] extends Optional ? k : never;
}[keyof T];
export type requiredMutableKeys<T extends object> = {
    [k in keyof T]: T[k] extends ReadOnly ? never : T[k] extends Optional ? never : k;
}[keyof T];

export type FullTypeDescriptor<T, U> = TypeDescriptor<T, U> & Partial<
    Optional &
    Nullable &
    ReadOnly &
    ModelPointer<any> &
    IsObject &
    IsProperties &
    ModelLogic<any> &
    OwnedCollection<any> &
    IsStatCollectionStorage & 
    IsStatComputation<any>
>;

export type ObjectDescriptor = Record<string, FullTypeDescriptor<any, any>>;

export type Optional = { isOptional: true; }
export type Nullable = { isNullable: true; }
export type ReadOnly = { isReadOnly: true; }
export type ModelPointer<T extends ModelName> = { modelPointerName: T; }
export type ModelLogic<T extends ModelName> = { modelLogic: T; }
export type OwnedBy = { ownedBy: true; }
export type TemplatedFrom = { templatedFrom: true; }
export type IsObject = { object: ObjectDescriptor; }
export type IsProperties = { properties: true; }
export type OwnedCollection<T extends ModelName> = { ownedCollection: T; }
export type IsStatCollectionStorage = { statCollectionStorage: true; }
export type IsStatComputation<T extends ModelName> = { statComputation: T; }

export type LogicStorage = {
    name: string;
    parameters?: Record<string, any>;
}

export function isObject(obj: any): obj is IsObject {
    return !!obj && obj.object !== undefined && typeof obj.object === 'object';
}

export function isModelPointer(obj: any): obj is ModelPointer<ModelName> {
    return !!obj && obj.modelPointerName !== undefined;
}

export function isOwnedBy(obj: any): obj is OwnedBy {
    return !!obj && obj.ownedBy !== undefined;
}

export function isTwoWayLink(obj: any): obj is OwnedBy & ModelPointer<ModelName> {
    return !!obj && obj.ownedBy !== undefined && obj.modelPointerName !== undefined;
}

export function isOwnedCollection(obj: any): obj is OwnedCollection<any> {
    return !!obj && obj.ownedCollection !== undefined;
}

export function isModelLogic(obj: any): obj is ModelLogic<ModelName> {
    return !!obj && obj.modelLogic !== undefined;
}

export function isStatCollectionStorage(obj: any): obj is IsStatCollectionStorage {
    return !!obj && obj.statCollectionStorage !== undefined;
}

type storageLeaf<D extends TypeDescriptor<any, any>> = StorageType<D>;
type proxyLeaf<D extends TypeDescriptor<any, any>> = ProxyType<D>;

type inferStorageObject<T extends ObjectDescriptor> = flatten<
    {
        [K in requiredKeys<T>]: storageLeaf<T[K]>;
    } & {
        [K in optionalKeys<T>]?: storageLeaf<T[K]>;
    }
>;

type inferProxyObject<T extends ObjectDescriptor> = flatten<{
    readonly [K in requiredReadOnlyKeys<T>]: proxyLeaf<T[K]>;
} & {
    readonly [K in optionalReadOnlyKeys<T>]?: proxyLeaf<T[K]>;
} & {
    [K in requiredMutableKeys<T>]: proxyLeaf<T[K]>;
} & {
    [K in optionalMutableKeys<T>]?: proxyLeaf<T[K]>;
}>;

type TD = TypeDescriptor<any, any>;

export const RTTI = {
    id: (): TypeDescriptor<number, number> & ReadOnly => {
        return {
            storageDescriptor: () => { throw new Error('not implemented') },
            proxyDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        } as const;
    },

    of: <T>(): TypeDescriptor<T, T> => {
        return {
            storageDescriptor: (): T => { throw new Error('not implemented') },
            proxyDescriptor: (): T => { throw new Error('not implemented') },
        };
    },

    modelPointer: <T extends ModelName>(modelName: T) => {
        return {
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ModelProxy<T> => { throw new Error('not implemented') },
        } as const;
    },

    ownedBy: <T extends ModelName>(modelName: T) => {
        return {
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ModelProxy<T> => { throw new Error('not implemented') },
            ownedBy: true,
        } as const;
    },

    templatedFrom: <T extends ModelName>(modelName: T) => {
        return {
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ModelProxy<T> => { throw new Error('not implemented') },
            templatedFrom: true,
        } as const;
    },

    object: <T extends ObjectDescriptor>(object: T) => {
        return {
            object,
            storageDescriptor: (): inferStorageObject<T> => { throw new Error('not implemented') },
            proxyDescriptor: (): inferProxyObject<T> => { throw new Error('not implemented') },
        };
    },

    partialRecord: <K extends string, T extends TD>(
        recordKeys: readonly K[],
        descriptor: T
    ) => {

        const desc = RTTI.optional(descriptor);
        const object = recordKeys.reduce((acc, key) => {
            acc[key] = desc;
            return acc;
        }, {} as Record<K, typeof desc>);

        return {
            object,
            storageDescriptor: (): inferStorageObject<Record<K, typeof desc>> => { throw new Error('not implemented') },
            proxyDescriptor: (): inferProxyObject<Record<K, typeof desc>> => { throw new Error('not implemented') },
        }
    },

    properties: <T extends Record<string, any>>() => {
        return {
            storageDescriptor: (): T => { throw new Error('not implemented') },
            proxyDescriptor: (): T => { throw new Error('not implemented') },
            properties: true,
            isReadOnly: true
        } as const;
    },

    logic: <T extends ModelName>(model: T) => {
        return {
            modelLogic: model,
            storageDescriptor: (): LogicStorage[] => { throw new Error('not implemented') },
            proxyDescriptor: (): LogicModelObject<T> => { throw new Error('not implemented') },
            isReadOnly: true
        } as const;
    },

    readonly: <T extends TD>(descriptor: T): T & ReadOnly => {
        return {
            ...descriptor,
            isReadOnly: true,
        } as const;
    },

    optional: <T extends TD>(descriptor: T) => {
        return {
            ...descriptor,
            isOptional: true,
        } as const;
    },

    nullable: <T extends TD>(descriptor: T) => {
        const {
            storageDescriptor,
            proxyDescriptor,
            ...rest
        } = descriptor;
        return {
            ...rest,
            storageDescriptor: (): StorageType<T> | null => { throw new Error('not implemented') },
            proxyDescriptor: (): ProxyType<T> | null => { throw new Error('not implemented') },
            isNullable: true,
        } as const;
    },

    default: <T extends TD>(descriptor: Text, defaultValue: StorageType<T>) => {
        return {
            ...descriptor,
            defaultValue,
        } as const;
    },

    ownedCollection: <T extends ModelName>(modelName: T) => {
        return {
            ownedCollection: modelName,
            isReadOnly: true,
            storageDescriptor: (): never => { throw new Error('not implemented') },
            proxyDescriptor: (): DbSet<T> => { throw new Error('not implemented') },
        } as const;
    },

    statCollectionStorage: () => { 
        return {
            storageDescriptor: (): StatCollectionStorage => { throw new Error('not implemented') },
            proxyDescriptor: (): StatCollectionProxy => { throw new Error('not implemented') },
            statCollectionStorage: true,
            isReadOnly: true
        } as const;
    },

    statComputation: <T extends ModelName>(modelName: T) => {
        return {
            storageDescriptor: (): never => { throw new Error('not implemented') },
            proxyDescriptor: (): StatCollectionComputed<T> => { throw new Error('not implemented') },
            statComputation: modelName,
            isReadOnly: true
        } as const;
    }
}
