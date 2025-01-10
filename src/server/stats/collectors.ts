import { ModelProxy } from "../models";
import { ModelName } from "../models/ModelNames";
import { StatName } from "./Stats";
import { RegardingStats, StatStorage } from "./types";


type StatCollectors = {
    [K in ModelName]: (
        model: ModelProxy<K>,
        regarding: RegardingStats,
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
        if(regarding.item) {
            
        }
        const collection = regarding.item?.collection ?? 'baseStats';
        return [
            ...item.itemTemplate[collection][stat].collect(regarding),
            ...item[collection][stat],
            ...item.logic.collectStats({ stat, regarding }),
        ]
    },
    'itemTemplate': (itemTemplate, regarding, stat) => {
        const collection = regarding.item?.collection ?? 'baseStats';
        return [
            ...itemTemplate[collection][stat],
            ...itemTemplate.logic.collectStats({ stat, regarding }),
        ];
    },
    'room': (room, regarding, stat) => {
        return [
            ...room.baseStats[stat],
            ...room.logic.collectStats({ stat, regarding }),
            ...room.area.baseStats[stat].collect(regarding),
        ]
    },
    'area': (area, regarding, stat) => {
        return [
            ...area.baseStats[stat],
            ...area.logic.collectStats({ stat, regarding }),
            ...area.region.baseStats[stat].collect(regarding),
        ]
    },
    'region': (region, regarding, stat) => {
        return [
            ...region.baseStats[stat],
            ...region.logic.collectStats({ stat, regarding }),
            ...region.world.baseStats[stat].collect(regarding),
        ]
    },
    'world': (world, regarding, stat) => {
        return [
            ...world.baseStats[stat],
            ...world.logic.collectStats({ stat, regarding }),
        ]
    }
}