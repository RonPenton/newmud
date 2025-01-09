//import Decimal from "decimal.js";
import { StatName } from "./Stats";
import { RegardingStats, StatStorage } from "./types";

// export type StatCollectionComputed = {
//     readonly [K in StatName]: Decimal & {
//         collect(regarding: RegardingStats): StatStorage[]
//     };
// }

export type StatCollectionStorage = {
    readonly [K in StatName]?: StatStorage[];
}

export type BaseStat = Iterable<StatStorage> & {
    add(stat: StatStorage): void;
    collect(regarding: RegardingStats): StatStorage[];
}

export type StatCollectionProxy = {
    readonly [K in StatName]: BaseStat;
}
