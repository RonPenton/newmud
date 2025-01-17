import { EquipmentSlot } from "../../equipment/equipmentTypes";
import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";

export const raceRegistration = registerModel({
    name: 'race',
    plural: 'races',
    descriptor: RTTI.object({
        ...defaultProperties('race'),
        equipmentSlots: RTTI.template(RTTI.readonly(RTTI.of<Record<string, EquipmentSlot>>()))
    }),
    onChanges: {}
});
