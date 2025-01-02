import { DbSet } from '../db/dbset';
import {
    flatten,
    inferProxyObject,
    inferStorageObject,
    ModelPointer,
    OwnedBy,
    ProxyStandin,
} from '../rtti';
import { ModelName } from './ModelNames';
import { Models } from './Models';

type D<T extends ModelName> = Models[T]['descriptor'];

export type LogicStorage = {
    name: string;
    parameters?: Record<string, any>;
}

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

export type ModelPlural<T extends ModelName> = Models[T]['plural'];

export type InferNull<T> = T extends null ? null : never;

export type ModelStorage<T extends ModelName> = inferStorageObject<D<T>>;
export type ModelProxy<T extends ModelName> = flatten<ReplaceProxyStandin<inferProxyObject<D<T>>>>;

type ReplaceProxyStandin<T extends Record<string, any>> = {
    [K in keyof T]: NonNullable<T[K]> extends ProxyStandin<infer U>
    ? ModelProxy<U> | InferNull<T[K]>
    : ReplaceProxyStandin<T[K]>;    // wrong
}

type A = ModelProxy<'room'>;