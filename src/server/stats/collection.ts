import Decimal from "decimal.js";
import { StatName } from "./Stats";
import { StatStorage } from "./types";
import { RegardingModel } from "../models";

export type StatCollectionComputed = {
    readonly [K in StatName]: Decimal & {
        collect(regarding: RegardingModel): StatStorage[]
    };
}

export type StatCollectionStorage = {
    readonly [K in StatName]?: StatStorage[];
}

export type BaseStat = Iterable<StatStorage> & {
    add(stat: StatStorage): void;
}

export type StatCollectionProxy = {
    readonly [K in StatName]: BaseStat;
}
