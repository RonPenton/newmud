import Decimal from "decimal.js";
import { ModelName } from "../models/ModelNames";
import { StatName } from "./Stats";
import { computeStatPhased, RegardingStat, StatStorage } from "./types";

type StatCollectors = {
    [K in ModelName]: (regarding: RegardingStat<K>, stat: StatName) => Iterable<StatStorage>;
}

export const statCollectors: StatCollectors = {
    'actor': (regarding, stat) => {
        const { record: actor } = regarding;
        const itemStats = actor.items.flatMap(item => {
            const base = item.baseStats[stat].collect();
            // todo: if equipped, add equipped stats
            // if(item.equipped) {
            //    equipped - item.equippedStats[stat].collect({ item: { record: item, collection: 'equippedStats' } });
            // }
            const equipped: StatStorage[] = [];

            const { value, applied, remaining } = computeStatPhased('item', new Decimal(0), [...base, ...equipped]);
            const s: StatStorage[] = applied.length == 0 ? [] : [{
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
    'item': (regarding, stat) => {
        const { record: item, collection } = regarding;
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
    'itemTemplate': (regarding, stat) => {
        const { record: itemTemplate, collection } = regarding;
        return [
            ...itemTemplate[collection][stat].raw(),
            ...itemTemplate.logic.collectStats({ stat, regarding }),
        ]
    },
    'room': (regarding, stat) => {
        const { record: room } = regarding;
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
    'area': (regarding, stat) => {
        const { record: area } = regarding;
        return [
            ...area.region.world.baseStats[stat].raw(),
            ...area.region.world.logic.collectStats({ stat, regarding }),
            ...area.region.baseStats[stat].raw(),
            ...area.region.logic.collectStats({ stat, regarding }),
            ...area.baseStats[stat].raw(),
            ...area.logic.collectStats({ stat, regarding }),
        ]
    },
    'region': (regarding, stat) => {
        const { record: region } = regarding;
        return [
            ...region.world.baseStats[stat].raw(),
            ...region.world.logic.collectStats({ stat, regarding }),
            ...region.baseStats[stat].raw(),
            ...region.logic.collectStats({ stat, regarding }),
        ]
    },
    'world': (regarding, stat) => {
        const { record: world } = regarding;
        return [
            ...world.baseStats[stat].raw(),
            ...world.logic.collectStats({ stat, regarding }),
        ]
    },
}