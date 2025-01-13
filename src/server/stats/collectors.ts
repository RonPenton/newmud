import Decimal from "decimal.js";
import { ModelProxy } from "../models";
import { ModelName } from "../models/ModelNames";
import { StatName } from "./Stats";
import { computeStatPhased, RegardingStats, StatStorage } from "./types";

type StatCollectors = {
    [K in ModelName]: (model: ModelProxy<K>, regarding: RegardingStats, stat: StatName) => Iterable<StatStorage>;
}

export const statCollectors: StatCollectors = {
    'actor': (actor, regarding, stat) => {
        const itemStats = actor.items.flatMap(item => {
            const base = item.baseStats[stat].collect();
            // todo: if equipped, add equipped stats
            // if(item.equipped) {
            //    equipped - item.equippedStats[stat].collect({ item: { record: item, collection: 'equippedStats' } });
            // }
            const equipped: StatStorage[] = [];

            const { value, all, remaining } = computeStatPhased('item', new Decimal(0), [...base, ...equipped]);
            const s: StatStorage[] =  all.length == 0 ? [] : [{
                type: 'value',
                value,
                scope: 'actor',
                appliesAt: 'total',
                explain: item.name
            }];
            return [
                ...s,
                ...remaining
            ]
        });

        return [
            // race/class here etc.
            ...actor.baseStats[stat].raw(),
            ...actor.logic.collectStats({ stat, regarding }),
            ...itemStats,
            ...actor.room.area.region.world.baseStats[stat].raw('actor'),
            ...actor.room.area.region.world.logic.collectStats({ stat, regarding }),
            ...actor.room.area.region.baseStats[stat].raw('actor'),
            ...actor.room.area.region.logic.collectStats({ stat, regarding }),
            ...actor.room.area.baseStats[stat].raw('actor'),
            ...actor.room.area.logic.collectStats({ stat, regarding }),
            ...actor.room.baseStats[stat].raw('actor'),
            ...actor.room.logic.collectStats({ stat, regarding }),
        ];
    },
    'item': (item, regarding, stat) => {
        const collection = regarding.item?.collection ?? 'baseStats';
        const room = item.room ?? item.actor?.room;
        if (!room) throw new Error('Item must be in a room to collect stats');
        return [
            ...item.itemTemplate[collection][stat].raw(),
            ...item.itemTemplate.logic.collectStats({ stat, regarding }),
            ...item[collection][stat].raw(),
            ...item.logic.collectStats({ stat, regarding }),
            ...room.area.region.world.baseStats[stat].raw('item'),
            ...room.area.region.world.logic.collectStats({ stat, regarding }),
            ...room.area.region.baseStats[stat].raw('item'),
            ...room.area.region.logic.collectStats({ stat, regarding }),
            ...room.area.baseStats[stat].raw('item'),
            ...room.area.logic.collectStats({ stat, regarding }),
            ...room.baseStats[stat].raw('item'),
            ...room.logic.collectStats({ stat, regarding }),
        ]
    },
    'itemTemplate': (itemTemplate, regarding, stat) => {
        const collection = regarding.item?.collection ?? regarding.itemTemplate?.collection ?? 'baseStats';
        return [
            ...itemTemplate[collection][stat].raw(),
            ...itemTemplate.logic.collectStats({ stat, regarding }),
        ]
    },
    'room': (room, regarding, stat) => {
        return [
            ...room.area.region.world.baseStats[stat].raw(),
            ...room.area.region.world.logic.collectStats({ stat, regarding }),
            ...room.area.region.baseStats[stat].raw(),
            ...room.area.region.logic.collectStats({ stat, regarding }),
            ...room.area.baseStats[stat].raw(),
            ...room.area.logic.collectStats({ stat, regarding }),
            ...room.baseStats[stat].raw(),
            ...room.logic.collectStats({ stat, regarding }),
        ]
    },
    'area': (area, regarding, stat) => {
        return [
            ...area.region.world.baseStats[stat].raw(),
            ...area.region.world.logic.collectStats({ stat, regarding }),
            ...area.region.baseStats[stat].raw(),
            ...area.region.logic.collectStats({ stat, regarding }),
            ...area.baseStats[stat].raw(),
            ...area.logic.collectStats({ stat, regarding }),
        ]
    },
    'region': (region, regarding, stat) => {
        return [
            ...region.world.baseStats[stat].raw(),
            ...region.world.logic.collectStats({ stat, regarding }),
            ...region.baseStats[stat].raw(),
            ...region.logic.collectStats({ stat, regarding }),
        ]
    },
    'world': (world, regarding, stat) => {
        return [
            ...world.baseStats[stat].raw(),
            ...world.logic.collectStats({ stat, regarding }),
        ]
    },
}