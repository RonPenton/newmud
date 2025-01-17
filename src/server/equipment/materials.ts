import { Registration } from '../utils/infer';

export interface Materials { }

export type MaterialRegistration<N extends string> = Registration<N> & {
}

export type MaterialRegistrationBatch = Record<string, Omit<MaterialRegistration<any>, 'name'>>;

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

export function registerMaterialBatch<T extends MaterialRegistrationBatch>(
    registrations: T
) {
    for (const name in registrations) {
        materialRegistrations[name] = { name, ...registrations[name] };
    }
    return registrations;
};

export type InferMaterialBatch<T extends MaterialRegistrationBatch> = {
    [K in keyof T]: T[K] & { name: K };
}

export type MaterialAugmentationBatch = {
    [K in MaterialType]?: MaterialAugmentation<K>;
}

export function augmentMaterialBatch<T extends Partial<Record<MaterialType, MaterialAugmentation<any>>>>(
    augmentations: T
) {
    Object.entries(augmentations).forEach(([name, augment]) => {
        materialRegistrations[name] = { ...materialRegistrations[name], ...augment };
    });
}
