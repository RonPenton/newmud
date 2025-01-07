import Decimal from "decimal.js";
import { ModelProxy } from "../models";
import { ModelName } from "../models/ModelNames";
import { getStatRegistration, StatName } from "./Stats";
import { coalesceStats, computeStat } from "./types";


type StatComputations = {
    [K in ModelName]: (model: ModelProxy<K>, stat: StatName) => Decimal;
}

function baseComputation(model: ModelProxy<ModelName>, stat: StatName) {
    const reg = getStatRegistration(stat);
    const statValue = model.baseStats[stat];
    const coalesced = coalesceStats([statValue], reg);
    return computeStat(coalesced, reg);
}

export const statComputations: StatComputations = {
    'actor': (actor, stat) => {
        const reg = getStatRegistration(stat);
        const statValue = actor.baseStats[stat];
        const coalesced = coalesceStats([statValue], reg);
        return computeStat(coalesced, reg);
    },
    'item': (item, stat) => {
        const reg = getStatRegistration(stat);
        const statValue = item.baseStats[stat];
        const coalesced = coalesceStats([statValue], reg);
        return computeStat(coalesced, reg);
    },
    'itemTemplate': (itemTemplate, stat) => {
        const reg = getStatRegistration(stat);
        const statValue = itemTemplate.baseStats[stat];
        const coalesced = coalesceStats([statValue], reg);
        return computeStat(coalesced, reg);
    },
    'room': baseComputation,
    'area': baseComputation,
    'region': baseComputation,
    'world': baseComputation
}