import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";


export const worldRegistration = registerModel({
    name: 'world',
    plural: 'worlds',
    descriptor: RTTI.object({
        ...defaultProperties('world'),
        regions: RTTI.ownedCollection('region'),
    }),
    onChanges: {}
});

