import { ActionRegistration, Descriptor } from "./action";



export const actionRegistry: Record<string, ActionRegistration<any, any>> = {};

/**
 * Registers an action with the game.
 * @param params 
 * @returns 
 */
export function registerAction<
    N extends string,
    T extends Record<string, Descriptor<any>>
>(params: ActionRegistration<N, T>) {
    actionRegistry[params.name] = params;
    return params;
}