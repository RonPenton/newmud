import { RTTI } from "../../../rtti";
import { UniverseManager } from "../../../universe/universe";
import { registerLogic } from "../../Logic";

const registration = registerLogic({
    model: 'room',
    name: 'describe',
    parameters: {
        universe: RTTI.of<UniverseManager>(),
        room: RTTI.modelPointer('room'),
        observer: RTTI.modelPointer('actor'),
    },
    result: RTTI.of<string>(),
    defaultValue: ({ room }) => room.name,
});

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

