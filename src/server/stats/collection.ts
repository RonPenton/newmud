import Decimal from "decimal.js";
import { StatName } from "./Stats";
import { StatStorage } from "./types";

export type StatCollectionComputed = {
    readonly [K in StatName]: Decimal;
}

export type StatCollectionStorage = {
    readonly [K in StatName]?: StatStorage;
}

export type StatCollectionProxy = {
    readonly [K in StatName]: Required<StatStorage>;
}
