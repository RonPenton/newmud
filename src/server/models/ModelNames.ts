export interface ModelNames { };

export type ModelNameRegistration<N extends string, P extends string, DB extends boolean> = {
    name: N;
    plural: P;
    isDatabaseModel: DB;
}

export type InferModelName<T extends ModelNameRegistration<any, any, any>> = {
    [K in T['name']]: T;
}

/**
 * A type representing the code names of each model in the game.
 */
export type ModelName = keyof ModelNames;

export type DbModelName = keyof {
    [K in ModelName as ModelNames[K] extends IsDatabaseModel ? K : never]: K;
};

type IsDatabaseModel = {
    isDatabaseModel: true;
}

export const modelNames: ModelName[] = [];
export const dbModelNames: DbModelName[] = [];
export const nonDbModelNames: Exclude<ModelName, DbModelName>[] = [];

export function registerModelName<
    N extends string,
    P extends string,
    DB extends boolean
>(registration: ModelNameRegistration<N, P, DB>): ModelNameRegistration<N, P, DB> {
    modelNames.push(registration.name as any);
    if(registration.isDatabaseModel) {
        dbModelNames.push(registration.name as any);
    } else {
        nonDbModelNames.push(registration.name as any);
    }

    return registration;
}
