import { IsObject } from '../rtti';
import { ModelPointer, Nullable, ObjectDescriptor, Optional, ReadOnly, TypeDescriptor } from '../rtti/types';
import { ModelName } from './ModelNames';
import { Models } from './Models';

type D<T extends ModelName> = Models[T]['descriptor'];

export type OptionalKeys<T extends ObjectDescriptor> = keyof {
    [K in keyof T as T[K] extends Optional ? K : never]: K;
}
export type NonOptionalKeys<T extends ObjectDescriptor> = keyof {
    [K in keyof T as T[K] extends Optional ? never : K]: K;
}

export type OptionalReadOnlyKeys<T extends ObjectDescriptor> = keyof {
    [K in OptionalKeys<T> as T[K] extends ReadOnly ? K : never]: K;
}
export type NonOptionalReadOnlyKeys<T extends ObjectDescriptor> = keyof {
    [K in NonOptionalKeys<T> as T[K] extends ReadOnly ? K : never]: K;
}
export type OptionalMutableKeys<T extends ObjectDescriptor> = keyof {
    [K in OptionalKeys<T> as T[K] extends ReadOnly ? never : K]: K;
}
export type NonOptionalMutableKeys<T extends ObjectDescriptor> = keyof {
    [K in NonOptionalKeys<T> as T[K] extends ReadOnly ? never : K]: K;
}

export type DescriptorType<T extends TypeDescriptor<any>> = T extends TypeDescriptor<infer U> ? U : never;

export type InferStorageLeaf<T> =
    T extends ModelPointer<any> ? number
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferStorageDescriptor<T> =
    T extends TypeDescriptor<infer U> & IsObject
    ? U extends ObjectDescriptor 
        ? InferStorageObject<U> 
        : never
    : InferStorageLeaf<T>;

export type InferStorageObject<T extends ObjectDescriptor> =
    flatten<
        {
            [K in NonOptionalKeys<T>]: InferStorageDescriptor<T[K]>;
        } & {
            [K in OptionalKeys<T>]?: InferStorageDescriptor<T[K]>;
        }
    >;

export type InferProxyLeaf<T> =
    T extends ModelPointer<infer M> ? ModelProxy<M>
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferProxyDescriptor<T> =
    T extends TypeDescriptor<infer U> & IsObject
    ? { [K in keyof U]: InferProxyDescriptor<U[K]>; }
    : InferProxyLeaf<T>;

export type InferProxyObject<T extends ObjectDescriptor> =
    flatten<
        {
            readonly [K in NonOptionalReadOnlyKeys<T>]: InferProxyDescriptor<T[K]>;
        } &
        {
            readonly [K in OptionalReadOnlyKeys<T>]?: InferProxyDescriptor<T[K]>;
        } &
        {
            [K in NonOptionalMutableKeys<T>]: InferProxyDescriptor<T[K]>;
        } &
        {
            [K in OptionalMutableKeys<T>]?: InferProxyDescriptor<T[K]>;
        }
    >;

/**
 * Identity type coerces typescript into evaluating a type expression, so that it 
 * is more readable and easier to debug.
 */
type identity<T> = T;

/**
 * Flatten type takes types joined by & and flattens them into a single object type, 
 * so that it is more readable and easier to debug.
 */
type flatten<T> = identity<{
    [k in keyof T]: T[k];
}>;



export type Storage<T extends ModelName> = InferStorageObject<D<T>>;
export type ModelProxy<T extends ModelName> = InferProxyObject<D<T>>;

export type ModelPlural<T extends ModelName> = Models[T]['plural'];

type A = ModelProxy<'actor'>;

type B = Storage<'actor'>;

type C = D<'actor'>;
