import { Registration } from '../utils/infer';
import { BodyPart } from './bodyParts';

export interface EquipmentTypes { }

export type EquipmentRegistration<N extends string> = Registration<N> & {
    readonly bodyPart: BodyPart;
}

export type EquipmentType = keyof EquipmentTypes;

const equipmentTypeRegistrations: Record<string, EquipmentRegistration<any>> = {};

export function registerEquipmentType<N extends string>(
    registration: EquipmentRegistration<N>
) {
    equipmentTypeRegistrations[registration.name] = registration;
    return registration;
}
