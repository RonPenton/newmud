import Decimal from "decimal.js";
import { ModelName, Storage } from "../models";
import { Game } from "../game/game";

export type Descriptor<T> = {
    typeDescriptor: () => T;
}

export type Optional = {
    optional: true;
}

type ModelReference<T extends ModelName> = {
    models: readonly T[];
    typeDescriptor: () => T;
}

export const Type = {
    model: <T extends ModelName>(models: T[] | T): ModelReference<T> => {
        return {
            models: Array.isArray(models) ? models : [models],
            typeDescriptor: () => { throw new Error('not implemented') }
        };
    },
    
    /**
     * Describes an optional field
     * @param descriptor 
     * @returns 
     */
    optional: <T>(descriptor: Descriptor<T>): Descriptor<T> & Optional => {
        return { 
            ...descriptor,
            optional: true
        };
    },

    of: <T>(): Descriptor<T> => {
        return { typeDescriptor: () => { throw new Error('not implemented') } };
    }
}

/**
 * Infers Model Storage types if specified.
 */
export type InferFinalModel<T> = T extends ModelName ? Storage<T> : T;

/**
 * Infers Model types if specified, allowing for numbers indicating the object ID, and strings
 * indicating the object name. A "resolver" function will be used to resolve strings and numbers
 * to the final objects. 
 */
export type InferInputModel<T> = T extends ModelName ? Storage<T> | string | number : T;

/**
 * Infers a leaf node type from a type descriptor.
 */
export type InferFinalLeaf<T> = T extends Descriptor<infer U> ? InferFinalModel<U> : never;

/**
 * Infers a leaf node type from a type descriptor.
 */
export type InferInputLeaf<T> = T extends Descriptor<infer U> ? InferInputModel<U> : never;

/**
 * Infers the "final" type of a model from a type containing type descriptor properties.
 * A Final model has every property fully resolved to its final type.
 * ie Actor Strings have been resolved to an actual Actor object. 
 */
export type InferFinalType<T> = {
    [K in keyof T as T[K] extends Optional ? never : K]: InferFinalLeaf<T[K]>;
} & {
    [K in keyof T as T[K] extends Optional ? K : never]?: InferFinalLeaf<T[K]>;
};

/**
 * Infers the "input" type of a model from a type containing type descriptor properties.
 * Model properties may be numbers or strings, which need to be resolved into their 
 * final types.
 */
export type InferInputType<T> = {
    [K in keyof T as T[K] extends Optional ? never : K]: InferInputLeaf<T[K]>;
} & {
    [K in keyof T as T[K] extends Optional ? K : never]?: InferInputLeaf<T[K]>;
};

export type ActionRegistration<
    N extends string,
    T extends Record<string, Descriptor<any>>
> = {
    name: N;
    descriptor: T;
    action: (args: InferFinalType<T> & { game: Game }) => void;
    resolver?: (game: Game, args: InferFinalType<T>) => InferFinalType<T>;
};

// Helper type to infer actions dynamically
export type InferAction<T extends ActionRegistration<any, any>> = {
    [K in T['name']]: T;
};
