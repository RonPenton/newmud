import { ExitDefinition } from "../../../models/definitions/room";
import { RTTI } from "../../../rtti";
import { Direction } from "../../../utils";
import { registerLogic, registerLogicDefault } from "../../Logic";

const registration = registerLogic({
    model: 'room',
    name: 'canExit',
    parameters: RTTI.object({
        actor: RTTI.modelPointer('actor'),
        startingRoom: RTTI.modelPointer('room'),
        destinationRoom: RTTI.modelPointer('room'),
        direction: RTTI.of<Direction>(),
        exit: ExitDefinition,
        //portal: RTTI.modelPointer('portal').optional(),
    }),
    result: RTTI.of<boolean>(),
});

registerLogicDefault(registration, () => true);


declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }
