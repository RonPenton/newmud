import Decimal from "decimal.js";
import { StatName } from "./Stats";
import { StatStorage } from "./types";

export type StatCollection = {
    [K in StatName]: Decimal;
}

export type StatCollectionStorage = {
    readonly [K in StatName]: Required<StatStorage>;
}

let l: StatCollectionStorage = {} as any;


l.hitpoints.base = new Decimal(100);
const x = l.hitpoints.percentTier1;// = new Decimal(10);