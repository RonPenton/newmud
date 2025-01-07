import { RTTI } from "../../rtti";
import { Directions } from "../../utils/direction";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";


export const ExitDefinition = RTTI.object({
    room: RTTI.readonly(RTTI.nullable(RTTI.modelPointer('room')))
    //portal: RTTI.readonly(RTTI.optional(RTTI.modelPointer('portal')))
});

export const roomRegistration = registerModel({
    name: 'room',
    plural: 'rooms',
    descriptor: RTTI.object({
        ...defaultProperties('room'),
        exits: RTTI.partialRecord(
            Directions,
            ExitDefinition
        ),
        actors: RTTI.ownedCollection('actor'),
        items: RTTI.ownedCollection('item'),
        area: RTTI.ownedBy('area'),
    }),
    onChanges: {}
})
