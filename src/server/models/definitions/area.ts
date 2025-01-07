import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";


export const areaRegistration = registerModel({
    name: 'area',
    plural: 'areas',
    descriptor: RTTI.object({
        ...defaultProperties('area'),
        rooms: RTTI.ownedCollection('room'),
        region: RTTI.ownedBy('region'),
    }),
    onChanges: {}
});

