import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { RegardingStats, StatStorage } from "../../../stats/types";
import { ModelName } from "../../../models/ModelNames";

export function registerComputeStat<M extends ModelName>(model: M) {
    const registration = registerLogic({
        model,
        name: 'computeStat',
        parameters: RTTI.object({
            stat: RTTI.of<StatName>(),
            regarding: RTTI.of<RegardingStats>()
        }),
        result: RTTI.nullable(RTTI.of<StatStorage>()),
    });

    registerLogicDefault(registration, () => null);
    return registration;
}

