import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { StatStorage } from "../../../stats/types";
import { RegardingModel } from "../../../models";
import { ModelName } from "../../../models/ModelNames";

export function registerCollectStats<M extends ModelName>(model: M) {
    const registration = registerLogic({
        model,
        name: 'collectStats',
        parameters: RTTI.object({
            stat: RTTI.of<StatName>(),
            regarding: RTTI.of<RegardingModel>()
        }),
        result: RTTI.of<StatStorage[]>(),
    });

    registerLogicDefault(registration, () => []);
    return registration;
}

