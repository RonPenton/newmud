export interface BodyParts { }

export type BodyPartRegistration<N extends string> = {
    readonly name: N;
    readonly description: string;
}

export type InferBodyPart<T extends BodyPartRegistration<any>> = {
    [K in T['name']]: T;
};

export type InferBodyParts<T extends Record<string, BodyPartRegistration<any>>> = {
    [K in keyof T as T[K]['name']]: T[K];
};

export type BodyPart = keyof BodyParts;

const bodyPartRegistrations: Record<string, BodyPartRegistration<any>> = {};

export function registerBodyPart<N extends string>(
    registration: BodyPartRegistration<N>
) {
    bodyPartRegistrations[registration.name] = registration;
    return registration;
}
