import { InferRegistrationBatch } from "../../utils/infer";
import { registerEquipmentType } from "../equipmentTypes";

const registrations = {
    weapon: registerEquipmentType({
        name: 'weapon',
        bodyPart: 'hand',
        description: 'A weapon that can deal damage.'
    }),
    helmet: registerEquipmentType({
        name: 'helmet',
        bodyPart: 'head',
        description: 'A helmet that can protect your head.'
    }),
};

declare module "../equipmentTypes" { interface EquipmentTypes extends InferRegistrationBatch<typeof registrations> { } }
