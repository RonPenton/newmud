import { BodyPart } from './bodyParts';

export interface EquipmentTypes { }

export type EquipmentRegistration<N extends string> = {
    readonly name: N;
    readonly bodyPart: BodyPart;
    readonly description: string;
}

export type InferEquipmentType<T extends EquipmentRegistration<any>> = {
    [K in T['name']]: T;
};

export type InferEquipmentTypes<T extends Record<string, EquipmentRegistration<any>>> = {
    [K in keyof T as T[K]['name']]: T[K];
};

export type EquipmentType = keyof EquipmentTypes;

const equipmentTypeRegistrations: Record<string, EquipmentRegistration<any>> = {};

export function registerEquipmentType<N extends string>(
    registration: EquipmentRegistration<N>
) {
    equipmentTypeRegistrations[registration.name] = registration;
    return registration;
}
