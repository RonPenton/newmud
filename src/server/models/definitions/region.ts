import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";


export const regionRegistration = registerModel({
    name: 'region',
    plural: 'regions',
    descriptor: RTTI.object({
        ...defaultProperties('region'),
        areas: RTTI.ownedCollection('area'),
        world: RTTI.ownedBy('world'),
    }),
    onChanges: {}
});

