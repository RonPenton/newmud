import { RTTI } from "../../rtti";
import { Directions } from "../../utils/direction";
import { registerModel } from "../Models";


export const ExitDefinition = RTTI.object({
    room: RTTI.readonly(RTTI.nullable(RTTI.modelPointer('room')))
    //portal: RTTI.readonly(RTTI.optional(RTTI.modelPointer('portal')))
});

export const roomRegistration = registerModel({
    name: 'room',
    plural: 'rooms',
    descriptor: RTTI.object({
        id: RTTI.id(),
        name: RTTI.of<string>(),
        exits: RTTI.partialRecord(
            Directions,
            ExitDefinition
        ),
        logic: RTTI.logic('room'),
    })
})
