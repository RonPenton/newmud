import { RTTI } from "../../../rtti";
import { StatName } from "../../../stats/Stats";
import { registerLogic, registerLogicDefault } from "../../Logic";
import { StatStorage } from "../../../stats/types";
import { RegardingModel } from "../../../models";
import { ModelName } from "../../../models/ModelNames";

export function registerComputeStat<M extends ModelName>(model: M) {
    const registration = registerLogic({
        model,
        name: 'computeStat',
        parameters: RTTI.object({
            stat: RTTI.of<StatName>(),
            regarding: RTTI.of<RegardingModel>()
        }),
        result: RTTI.nullable(RTTI.of<StatStorage>()),
    });

    registerLogicDefault(registration, () => null);
    return registration;
}

