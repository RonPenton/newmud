import Decimal from "decimal.js";
import { ModelName } from "../models/ModelNames";

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
export type requiredKeys<T extends object> = { [k in keyof T]: T[k] extends Optional ? never : k; }[keyof T];

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

export type addQuestionMarks<T extends object> = {
    [K in requiredKeys<T>]: T[K];
} & {
    [K in optionalKeys<T>]?: T[K];
};

export type addReadonly<T extends object> = {
    readonly [K in requiredReadOnlyKeys<T>]: T[K];
} & {
    readonly [K in optionalReadOnlyKeys<T>]?: T[K];
} & {
    [K in requiredMutableKeys<T>]: T[K];
} & {
    [K in optionalMutableKeys<T>]?: T[K];
};

export type FullTypeDescriptor<T, U> = TypeDescriptor<T, U> & Partial<
    Optional &
    Nullable &
    ReadOnly &
    ModelPointer<any> &
    IsObject &
    IsProperties &
    ModelLogic
>;

export type ObjectDescriptor = Record<string, FullTypeDescriptor<any, any>>;

export type Optional = { isOptional: true; }
export type Nullable = { isNullable: true; }
export type ReadOnly = { isReadOnly: true; }
export type ModelPointer<T extends ModelName> = { modelPointerName: T; }
export type ModelLogic = { modelLogic: true; }
export type OwnedBy = { ownedBy: true; }
export type TemplatedFrom = { templatedFrom: true; }
export type IsObject = { object: ObjectDescriptor; }
export type IsProperties = { properties: true; }

/**
 * A hack to get around the circular dependency of ModelProxy<T>
 * requiring RTTI to be defined before it can be used in RTTI
 */
export type ProxyStandin<T extends ModelName> = { modelPointerName: T; }

/**
 * A hack to get around the circular dependency of Model Logic resolution
 */
export type LogicStandin = { modelLogic: true }

export type LogicStorage = {
    name: string;
    parameters?: Record<string, any>;
}

export function isObject(obj: any): obj is IsObject {
    return !!obj && obj.object !== undefined && typeof obj.object === 'object';
}

export function isModelPointer(obj: any): obj is ModelPointer<any> {
    return !!obj && obj.modelPointerName !== undefined;
}

export function isOwnedBy(obj: any): obj is OwnedBy {
    return !!obj && obj.ownedBy !== undefined;
}

export function isTwoWayLink(obj: any): obj is OwnedBy & ModelPointer<any> {
    return !!obj && obj.ownedBy !== undefined && obj.modelPointerName !== undefined;
}

type storageLeaf<D extends TypeDescriptor<any, any>> = D extends TypeDescriptor<infer U, any>
    ? U extends Decimal ? Decimal 
    : flatten<U>
    : never;
type proxyLeaf<D extends TypeDescriptor<any, any>> = D extends TypeDescriptor<any, infer U>
    ? U extends Decimal ? Decimal
    : flatten<U>
    : never;

export type inferStorageObject<T extends ObjectDescriptor> = inferStorage<addQuestionMarks<T>>;
type inferStorage<T extends ObjectDescriptor> = { [K in keyof T]: storageLeaf<T[K]>; }

export type inferProxyObject<T extends ObjectDescriptor> = inferProxy<addReadonly<T>>;
type inferProxy<T extends ObjectDescriptor> = { [K in keyof T]: proxyLeaf<T[K]>; }

export type inferProxyDescriptor<T extends TypeDescriptor<any, any>> = proxyLeaf<T>;

export const RTTI = {
    id: (): TypeDescriptor<number, number> & ReadOnly => {
        return {
            storageDescriptor: () => { throw new Error('not implemented') },
            proxyDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        } as const;
    },

    of: <T>(): TypeDescriptor<T, T> & RTTIChainable<TypeDescriptor<T, T>> => {
        return rttiChainable({
            storageDescriptor: (): T => { throw new Error('not implemented') },
            proxyDescriptor: (): T => { throw new Error('not implemented') },
        });
    },

    modelPointer: <T extends ModelName>(modelName: T) => {
        return rttiChainable({
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ProxyStandin<T> => { throw new Error('not implemented') },
        } as const);
    },

    ownedBy: <T extends ModelName>(modelName: T) => {
        return rttiChainable({
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ProxyStandin<T> => { throw new Error('not implemented') },
            ownedBy: true,
        } as const);
    },

    templatedFrom: <T extends ModelName>(modelName: T) => {
        return rttiChainable({
            modelPointerName: modelName,
            storageDescriptor: (): number => { throw new Error('not implemented') },
            proxyDescriptor: (): ProxyStandin<T> => { throw new Error('not implemented') },
            templatedFrom: true,
        } as const);
    },

    object: <T extends ObjectDescriptor>(object: T) => {
        return rttiChainable({
            object,
            storageDescriptor: (): inferStorageObject<T> => { throw new Error('not implemented') },
            proxyDescriptor: (): inferProxyObject<T> => { throw new Error('not implemented') },
        });
    },

    partialRecord: <K extends string, T extends TypeDescriptor<any, any>>(
        recordKeys: readonly K[],
        descriptor: T
    ) => {

        const desc = rttiChainable(descriptor).optional();
        const object = recordKeys.reduce((acc, key) => {
            acc[key] = desc;
            return acc;
        }, {} as Record<K, typeof desc>);

        return rttiChainable({
            object,
            storageDescriptor: (): inferStorageObject<Record<K, typeof desc>> => { throw new Error('not implemented') },
            proxyDescriptor: (): inferProxyObject<Record<K, typeof desc>> => { throw new Error('not implemented') },
        })
    },

    properties: <T extends Record<string, any>>() => {
        return {
            storageDescriptor: (): T => { throw new Error('not implemented') },
            proxyDescriptor: (): T => { throw new Error('not implemented') },
            properties: true,
            isReadOnly: true
        } as const;
    },

    logic: () => {
        return {
            modelLogic: true,
            storageDescriptor: (): LogicStorage[] => { throw new Error('not implemented') },
            proxyDescriptor: (): LogicStandin => { throw new Error('not implemented') },
            isReadOnly: true
        } as const;
    }
}

export type RTTIChainable<D extends TypeDescriptor<any, any>> = ReturnType<typeof rttiChainable<D>>;

export function rttiChainable<D extends TypeDescriptor<any, any>>(
    descriptor: D,
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
                storageDescriptor,
                proxyDescriptor,
                ...rest
            } = descriptor;
            return rttiChainable({
                ...rest,
                storageDescriptor: (): StorageType<D> | null => { throw new Error('not implemented') },
                proxyDescriptor: (): ProxyType<D> | null => { throw new Error('not implemented') },
                isNullable: true,
            } as const);
        },

        default: (defaultValue: StorageType<D>): D => {
            return rttiChainable({
                ...descriptor,
                defaultValue,
            } as const);
        }
    }
}
