import Decimal from "decimal.js";
import { ModelName } from "../models/ModelNames";
import { StatName, Stats } from "./Stats";
import { StatStorage } from "./types";

type StatsFor<M extends ModelName> = {
    [K in keyof Stats as M extends Stats[K]['models'][number] ? K : never]: Stats[K];
};

export type StatCollectionComputed<M extends ModelName> = {
    readonly [K in keyof StatsFor<M>]: Decimal & {
        explain: string;
    };
}

export type StatCollectionStorage = {
    readonly [K in StatName]?: StatStorage[];
}

export type StatsCollected = {
    value: Decimal;
    all: StatStorage[];
    applied: StatStorage[];
    remaining: StatStorage[];
}

export type BaseStat = {
    add(stat: StatStorage): void;
    collect(): Iterable<StatStorage>;
    raw(filter?: ModelName): Iterable<StatStorage>;
}

export type StatCollectionProxy = {
    readonly [K in StatName]: BaseStat;
}
