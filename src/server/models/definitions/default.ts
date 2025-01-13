import { RTTI } from "../../rtti"
import { ModelName } from "../ModelNames"

export function defaultProperties<M extends ModelName>(m: M) {
    return {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        logic: RTTI.logic(m),
        baseStats: RTTI.statCollectionStorage(),
        stats: RTTI.statComputation(m)
    }
}