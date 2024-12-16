import { ModelPointer, Optional, ReadOnly, TypeDescriptor } from '../rtti/types';
import { ModelName } from './ModelNames';
import { Models } from './Models';


type D<T extends ModelName> = Models[T]['descriptor'];

export type InferStorageLeaf<T> =
    T extends ModelPointer<any> ? number
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferProxyLeaf<T> =
    T extends ModelPointer<infer M> ? ModelProxy<M>
    : T extends TypeDescriptor<infer U> ? U
    : never;

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

export type OptionalKeys<T extends ModelName> = keyof {
    [K in keyof D<T> as D<T>[K] extends Optional ? K : never]: K;
}
export type NonOptionalKeys<T extends ModelName> = keyof {
    [K in keyof D<T> as D<T>[K] extends Optional ? never : K]: K;
}

export type OptionalReadOnlyKeys<T extends ModelName> = keyof {
    [K in OptionalKeys<T> as D<T>[K] extends ReadOnly ? K : never]: K;
}
export type NonOptionalReadOnlyKeys<T extends ModelName> = keyof {
    [K in NonOptionalKeys<T> as D<T>[K] extends ReadOnly ? K : never]: K;
}
export type OptionalMutableKeys<T extends ModelName> = keyof {
    [K in OptionalKeys<T> as D<T>[K] extends ReadOnly ? never : K]: K;
}
export type NonOptionalMutableKeys<T extends ModelName> = keyof {
    [K in NonOptionalKeys<T> as D<T>[K] extends ReadOnly ? never : K]: K;
}

export type Storage<T extends ModelName> =
    flatten<
        {
            [K in NonOptionalKeys<T>]: InferStorageLeaf<D<T>[K]>;
        } & {
            [K in OptionalKeys<T>]?: InferStorageLeaf<D<T>[K]>;
        }
    >;

export type ModelProxy<T extends ModelName> =
    flatten<
        {
            readonly [K in NonOptionalReadOnlyKeys<T>]: InferProxyLeaf<D<T>[K]>;
        } &
        {
            readonly [K in OptionalReadOnlyKeys<T>]?: InferProxyLeaf<D<T>[K]>;
        } &
        {
            [K in NonOptionalMutableKeys<T>]: InferProxyLeaf<D<T>[K]>;
        } &
        {
            [K in OptionalMutableKeys<T>]?: InferProxyLeaf<D<T>[K]>;
        }
    >;

export type ModelPlural<T extends ModelName> = Models[T]['plural'];
