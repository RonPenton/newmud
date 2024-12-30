import { DbSet } from '../db/dbset';
import {
    IsObject,
    ModelPointer,
    ObjectDescriptor,
    Optional,
    ReadOnly,
    TypeDescriptor,
    Nullable,
    OwnedBy
} from '../rtti/types';
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

export type InferNull<T> =
    T extends Nullable ? null : never;

export type InferStorageLeaf<T> =
    T extends ModelPointer<any> ? number | InferNull<T>
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferStorageDescriptor<T> =
    T extends TypeDescriptor<infer U> & IsObject
    ? Exclude<U, null> extends ObjectDescriptor
    ? InferStorageObject<Exclude<U, null>> | Extract<U, null>
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
    T extends ModelPointer<infer M> ? ModelProxy<M> | InferNull<T>
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferProxyDescriptor<T> =
    T extends TypeDescriptor<infer U> & IsObject
    ? Exclude<U, null> extends ObjectDescriptor
    ? InferProxyObject<Exclude<U, null>> | Extract<U, null>
    : never
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

export type WithoutDescriptor<T extends TypeDescriptor<any>> = Omit<T, 'typeDescriptor'>;

/**
 * PointsTo<T, U> is a type that determines if A points to B in an "owned by" relationship.
 * eg:
 *     type A = PointsTo<'item', 'actor'>; // A is 'item', because 'item' points to 'actor'
 *     type B = PointsTo<'actor', 'item'>; // B is never, because 'actor' does not point to 'item'
 * 
 * This can be leveraged by more complex types to create new properties to store the collection
 * of owned objects. See "EveryPointsTo" below.
 */
type PointsTo<T extends ModelName, U extends ModelName> = keyof {
    [K in keyof D<T> as D<T>[K] extends ModelPointer<U> & OwnedBy ? T : never]: T;
}

/**
 * EveryPointsTo<T> is a type that determines all the types that point to T in an "owned by" relationship.
 * eg:
 *    type A = EveryPointsTo<'room'>; // A is 'item' | 'actor', because rooms own both items and actors.
 */
type EveryPointsTo<T extends ModelName> = keyof {
    [K in ModelName as PointsTo<K, T> extends never ? never : K]: K;
}

/**
 * AddSets<T> is a type that creates a set of DbSet objects for each type that points to T in an "owned by" relationship.
 * eg:
 *   type A = AddSets<'room'>; // A is { items: DbSet<'item'>, actors: DbSet<'actor'> }
 */
export type AddSets<T extends ModelName> = T extends ModelName ? {
    readonly [K in EveryPointsTo<T> as ModelPlural<K>]: DbSet<K>;
} : {};

/**
 * Base type for all DbObjects, which require both an ID and a name. 
 */
export type DbObject = {
    readonly id: number;
    name: string;
}

export type ModelStorage<T extends ModelName> = flatten<InferStorageObject<D<T>> & DbObject>;

export type ModelProxy<T extends ModelName> = flatten<InferProxyObject<D<T>> & AddSets<T> & DbObject>;

export type ModelPlural<T extends ModelName> = Models[T]['plural'];
