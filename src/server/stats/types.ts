import Decimal from "decimal.js";
import { keysOf } from "tsc-utils";
import { StatRegistration } from "./Stats";
import { caps } from "./softcap";

export type StatStorage = {
    base?: Decimal;
    max?: Decimal;
    min?: Decimal;
    softcapScale?: Decimal;
    [key: `percentTier${number}`]: Decimal;
    percentCompounding?: Decimal;
}

export type StatCoalesced = Omit<StatStorage, 'percentCompounding'> & {
    percentCompounding: Decimal[];
}

export function coalesceStats(stats: StatStorage[], registration: StatRegistration<any>): StatCoalesced {

    const { max, min, softcapScale } = registration;
    const result: StatCoalesced = {
        percentCompounding: [],
        max,
        min,
        softcapScale
    };
    for (const stat of stats) {
        for (const key of keysOf(stat)) {
            if (stat[key] !== undefined) {
                if (key === 'percentCompounding') {
                    result.percentCompounding.push(stat[key]);
                    continue;
                }
                if (result[key] === undefined) {
                    result[key] = stat[key];
                }
                else {
                    result[key] = result[key].add(stat[key]);
                }
            }
        }
    }
    return result;
}

export function computeStat(stat: StatCoalesced, registration: StatRegistration<any>): Decimal {
    let result = new Decimal(0);
    if (stat.base) {
        result = result.add(stat.base);
    }

    const tiers = keysOf(stat).filter(k => k.startsWith('percentTier')).map(k => parseInt(k.slice(11)));
    for (const tier of tiers) {
        const p = stat[`percentTier${tier}`].div(100).add(1);
        result = result.mul(p);
    }

    for (const p of stat.percentCompounding) {
        result = result.mul(p.div(100).add(1));
    }

    // apply the max cap.
    result = caps[registration.capType](result, stat.max, stat.softcapScale);

    // apply the min cap.
    const min = stat.min ?? new Decimal(-Infinity);
    if (result.lt(min)) {
        result = min;
    }

    return result;
}
