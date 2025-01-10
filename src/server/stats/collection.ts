import Decimal from "decimal.js";
import { ModelName } from "../models/ModelNames";
import { StatName, Stats } from "./Stats";
import { RegardingStats, StatStorage } from "./types";

type StatsFor<M extends ModelName> = {
    [K in keyof Stats as M extends Stats[K]['models'][number] ? K : never]: Stats[K];
};

export type StatCollectionComputed<M extends ModelName> = {
    readonly [K in keyof StatsFor<M>]: Decimal;
}

type C = StatCollectionComputed<'actor'>;
type D = StatCollectionComputed<'item'>;

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
