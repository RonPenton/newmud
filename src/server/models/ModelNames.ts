export interface ModelNames {};

export type InferModelName<T extends string> = {
    [K in T]: K;
}

/**
 * A type representing the code names of each model in the game.
 */
export type ModelName = keyof ModelNames;

export const modelNames: ModelName[] = [];

export function registerModelName<T extends string>(name: T): T {
    modelNames.push(name as any);
    return name;
}