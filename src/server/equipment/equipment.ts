export interface EquipmentClassifications { }

export type EquipmentRegistration<N extends string> = {
    readonly name: N;
    readonly description: string;
}

