import Decimal from "decimal.js";
import { ModelProxy, RegardingModel } from "../models";
import { ModelName } from "../models/ModelNames";
import { getStatRegistration, StatName } from "./Stats";
import { coalesceStats, computeStat, StatStorage } from "./types";


type StatCollectors = {
    [K in ModelName]: (
        model: ModelProxy<K>,
        regarding: RegardingModel,
        stat: StatName,
    ) => StatStorage[];
}

export const statCollectors: StatCollectors = {
    'actor': (actor, regarding, stat) => {
        return [
            ...actor.baseStats[stat],
            ...actor.logic.collectStats({ stat, regarding }),
            ...actor.items.flatMap(item => item.stats[stat].collect(regarding)),
            ...actor.room.stats[stat].collect(regarding),
            ...actor.room.area.stats[stat].collect(regarding),
        ]
    },
    'item': (item, regarding, stat) => {
    },
    'itemTemplate': (itemTemplate, regarding, stat) => {
    },
    'room': (room, regarding, stat) => {
        return [
            ...room.baseStats[stat],
            ...room.logic.collectStats({ stat, regarding }),
            ...room.area.stats[stat].collect(regarding),
        ]
    },
    'area': (area, regarding, stat) => {
        return [
            ...area.baseStats[stat],
            ...area.logic.collectStats({ stat, regarding }),
            ...area.region.stats[stat].collect(regarding),
        ]
    },
    'region': (region, regarding, stat) => {
        return [
            ...region.baseStats[stat],
            ...region.logic.collectStats({ stat, regarding }),
            ...region.world.stats[stat].collect(regarding),
        ]
    },
    'world': (world, regarding, stat) => {
        return [
            ...world.baseStats[stat],
            ...world.logic.collectStats({ stat, regarding }),
        ]
    }
    }
}