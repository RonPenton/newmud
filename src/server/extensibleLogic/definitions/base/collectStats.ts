import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { RegardingStats, StatStorage } from "../../../stats/types";
import { ModelName } from "../../../models/ModelNames";

export function registerCollectStats<M extends ModelName>(model: M) {
    const registration = registerLogic({
        model,
        name: 'collectStats',
        parameters: RTTI.object({
            stat: RTTI.of<StatName>(),
            regarding: RTTI.of<RegardingStats>()
        }),
        result: RTTI.of<StatStorage[]>(),
    });

    registerLogicDefault(registration, () => []);
    return registration;
}

