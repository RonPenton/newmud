import { ExitDefinition } from "../../models/definitions/room";
import { RTTI } from "../../rtti";
import { UniverseManager } from "../../universe/universe";
import { Direction } from "../../utils";
import { registerEvent } from "../Events";

const registration = registerEvent({
    model: 'room',
    name: 'canExit',
    parameters: {
        universe: RTTI.of<UniverseManager>(),
        actor: RTTI.modelPointer('actor'),
        startingRoom: RTTI.modelPointer('room'),
        destinationRoom: RTTI.modelPointer('room'),
        direction: RTTI.of<Direction>(),
        exit: ExitDefinition,
        portal: RTTI.modelPointer('portal').optional(),
    },
    result: RTTI.of<boolean>(),
    defaultValue: () => true,
});

declare module "../Events" { interface EventsRaw extends InferEvent<typeof registration> { } }

