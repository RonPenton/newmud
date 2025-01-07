import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { StatStorage } from "../../../stats/types";

const registration = registerLogic({
    model: 'actor',
    name: 'computeStat',
    parameters: RTTI.object({
        stat: RTTI.of<StatName>(),
    }),
    result: RTTI.nullable(RTTI.of<StatStorage>()),
});

registerLogicDefault(registration, () => null);

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

