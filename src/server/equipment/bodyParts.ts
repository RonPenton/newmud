import { Registration } from "../utils/infer";

export interface BodyParts { }

export type BodyPartRegistration<N extends string> = Registration<N>;

export type BodyPart = keyof BodyParts;

const bodyPartRegistrations: Record<string, BodyPartRegistration<any>> = {};

export function registerBodyPart<N extends string>(
    registration: BodyPartRegistration<N>
) {
    bodyPartRegistrations[registration.name] = registration;
    return registration;
}
