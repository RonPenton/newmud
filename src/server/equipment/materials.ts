import { Registration } from '../utils/infer';

export interface Materials { }

export type MaterialRegistration<N extends string> = Registration<N> & {
}

export type MaterialType = keyof Materials;

export type MaterialRegistrationAugmented<N extends string> = MaterialRegistration<N> & {
    parentMaterial?: MaterialType;
}

export type MaterialAugmentation<N extends string> = Omit<MaterialRegistrationAugmented<N>, keyof MaterialRegistration<N>>;

const materialRegistrations: Record<string, MaterialRegistrationAugmented<any>> = {};

export function registerMaterialType<N extends string>(
    registration: MaterialRegistration<N>
) {
    materialRegistrations[registration.name] = registration;
    return registration;
}

export function augmentRegistration<N extends string>(
    registration: MaterialRegistration<N>,
    augment: MaterialAugmentation<N>
) {
    const augmented = { ...registration, ...augment };
    materialRegistrations[registration.name] = augmented;
    return augmented;
}
