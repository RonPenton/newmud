import Decimal from "decimal.js";
import { keysOf } from "tsc-utils";

type Stat = {
    base?: Decimal;
    max?: Decimal;
    min?: Decimal;
    [key: `percentTier${number}`]: Decimal;
    percentCompounding?: Decimal;
}

type StatCoalesced = Omit<Stat, 'percentCompounding'> & {
    percentCompounding: Decimal[];
}

const hps: Stat[] = [
    { base: new Decimal(10) },
    { percentTier0: new Decimal(10) },
    { percentTier0: new Decimal(3) },
    { percentTier1: new Decimal(5) },
    { base: new Decimal(5) },
    { percentTier1: new Decimal(1), base: new Decimal(1) },
    { percentCompounding: new Decimal(10) },
    { percentCompounding: new Decimal(5) },
    { percentCompounding: new Decimal(1) },
    { percentCompounding: new Decimal(-50) },
]

function coalesceStats(stats: Stat[]): StatCoalesced {
    const result: StatCoalesced = {
        percentCompounding: []
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

const c = coalesceStats(hps);
console.log(c);


function computeStat(stat: StatCoalesced): Decimal {
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

    return result;
}

console.log(computeStat(c));