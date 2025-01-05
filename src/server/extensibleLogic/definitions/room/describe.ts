import { RTTI } from "../../../rtti";
import { UniverseManager } from "../../../universe/universe";
import { registerLogic, registerLogicDefault } from "../../Logic";

const registration = registerLogic({
    model: 'room',
    name: 'describe',
    parameters: RTTI.object({
        universe: RTTI.of<UniverseManager>(),
        room: RTTI.modelPointer('room'),
        observer: RTTI.modelPointer('actor'),
    }),
    result: RTTI.of<string>(),
});

registerLogicDefault(registration, ({ room }) => {
    return room.name;
});

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }
