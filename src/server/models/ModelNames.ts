export interface ModelNames { };

export type ModelNameRegistration<N extends string, P extends string> = {
    name: N;
    plural: P;
}

export type InferModelName<T extends ModelNameRegistration<any, any>> = {
    [K in T['name']]: T;
}

/**
 * A type representing the code names of each model in the game.
 */
export type ModelName = keyof ModelNames;

export const modelRegistrations: Record<ModelName, ModelNameRegistration<string, string>> = {} as any;
export const modelNames: ModelName[] = [];

export function registerModelName<
    N extends string,
    P extends string
>(registration: ModelNameRegistration<N, P>): ModelNameRegistration<N, P> {
    modelRegistrations[registration.name as ModelName] = registration;
    modelNames.push(registration.name as any);
    return registration;
}

export type PluralName = ModelNames[keyof ModelNames]['plural'];

export function pluralName<N extends ModelName>(name: N): PluralName {
    return modelRegistrations[name].plural as any;
}

export function singularName<P extends PluralName>(name: P): ModelName {
    return modelNames.find(x => modelRegistrations[x].plural === name) as any;
}
