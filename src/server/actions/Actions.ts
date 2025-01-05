import { IsObject, ProxyType, TypeDescriptor } from "../rtti";
import fs from 'fs';
import { UniverseManager } from "../universe/universe";

export interface ActionRegistrations { }

export type ActionRegistration<
    N extends string,
    T extends TypeDescriptor<any, any> & IsObject
> = {
    name: N;
    parameters: T;
    implementation: (args: ProxyType<T> & { universe: UniverseManager}) => void;
}

export const actionRegistrations: Record<string, ActionRegistration<any, any>> = {} as any;

// Helper type to infer actions dynamically
export type InferAction<T extends ActionRegistration<any, any>> = {
    [K in T['name']]: T;
};

export function registerAction<
    N extends string,
    T extends TypeDescriptor<any, any> & IsObject
>(
    registration: ActionRegistration<N, T>,
): ActionRegistration<N, T> {
    actionRegistrations[registration.name] = registration;
    return registration;
}

export type ActionCollection = {
    [K in keyof ActionRegistrations]: ActionRegistrations[K]['implementation'];
}

export const Actions = new Proxy<ActionCollection>({} as any, {
    get: (_, prop) => {
        const action = actionRegistrations[prop as string];
        if (!action) {
            throw new Error(`Action ${String(prop)} not found`);
        }
        return action.implementation;
    }
});

export async function loadActions() {
    const files = fs.readdirSync(__dirname + '/definitions').filter(f => f.endsWith('.ts'));
    for (const file of files) {
        await import('./definitions/' + file);
    }
}
