import { RTTI } from '../rtti';
import { ModelPointer, Optional, TypeDescriptor } from '../rtti/types';
import { ModelName } from './ModelNames';
import { Models } from './Models';


type D<T extends ModelName> = Models[T]['descriptor'];

export type InferStorageLeaf<T> =
    T extends ModelPointer<any> ? number
    : T extends TypeDescriptor<infer U> ? U
    : never;

export type InferProxyLeaf<T> =
    T extends ModelPointer<infer M> ? readonly ModelProxy<M>
    : T extends TypeDescriptor<infer U> ? U
    : never;

type identity<T> = T;
type flatten<T> = identity<{
    [k in keyof T]: T[k];
}>;

export type Storage<T extends ModelName> =
    flatten<
        {
            [K in keyof D<T> as D<T>[K] extends Optional ? never : K]: InferStorageLeaf<D<T>[K]>;
        } & {
            [K in keyof D<T> as D<T>[K] extends Optional ? K : never]?: InferStorageLeaf<D<T>[K]>;
        }
    >;

export type ModelProxy<T extends ModelName> =
    flatten<
        {
            [K in keyof D<T> as D<T>[K] extends Optional ? never : K]: InferProxyLeaf<D<T>[K]>;
        } & {
            [K in keyof D<T> as D<T>[K] extends Optional ? K : never]: InferProxyLeaf<D<T>[K]>;
        }
    >;


type A = Storage<'item'>;

type B = ModelProxy<'item'>;


type F = {
    readonly name: string;
}

export type ModelPlural<T extends ModelName> = Models[T]['plural'];
