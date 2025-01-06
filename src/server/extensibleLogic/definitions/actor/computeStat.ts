import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { UniverseManager } from "../../../universe/universe";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { StatStorage } from "../../../stats/types";

const registration = registerLogic({
    model: 'actor',
    name: 'computeStat',
    parameters: RTTI.object({
        universe: RTTI.of<UniverseManager>(),
        actor: RTTI.modelPointer('actor'),
        stat: RTTI.of<StatName>(),
    }),
    result: RTTI.of<StatStorage>(),
});

registerLogicDefault(registration, () => ({}));

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

