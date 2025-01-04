import { ExitDefinition } from "../../../models/definitions/room";
import { RTTI } from "../../../rtti";
import { UniverseManager } from "../../../universe/universe";
import { Direction } from "../../../utils";
import { registerLogic } from "../../Logic";

const registration = registerLogic({
    model: 'room',
    name: 'canEnter',
    parameters: RTTI.object({
        universe: RTTI.of<UniverseManager>(),
        actor: RTTI.modelPointer('actor'),
        startingRoom: RTTI.modelPointer('room'),
        destinationRoom: RTTI.modelPointer('room'),
        direction: RTTI.of<Direction>(),
        exit: ExitDefinition,
        //portal: RTTI.optional(RTTI.modelPointer('portal')),
    }),
    result: RTTI.of<boolean>(),
    defaultValue: () => true,
});

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

