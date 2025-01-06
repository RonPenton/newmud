import Decimal from "decimal.js";
import { coalesceStats, computeStat, StatCoalesced, StatStorage } from "../src/server/stats/types";
import { caps } from "../src/server/stats/softcap";
import { getStatRegistration, loadStatDefinitions } from "../src/server/stats/Stats";

describe('test', () => {

    beforeAll(async () => {
        await loadStatDefinitions();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('softcap no cap', () => {
        const val = caps.log2(new Decimal(100), new Decimal(100), new Decimal(0.1));
        expect(val.eq(100)).toBe(true);
    });

    test('softcap above cap 2x', () => {
        const val = caps.log2(new Decimal(200), new Decimal(100), new Decimal(0.5));
        expect(val.eq(150)).toBe(true);
    });

    test('softcap above cap 4x', () => {
        const val = caps.log2(new Decimal(400), new Decimal(100), new Decimal(0.5));
        expect(val.eq(200)).toBe(true);
    });

    test('softcap above cap 10x', () => {
        const val = caps.log2(new Decimal(1000), new Decimal(100), new Decimal(0.5));
        console.log(val);
        expect(val.eq('266.0964047443681174')).toBe(true);
    });

    test('softcap above cap smaller factor', () => {
        const val = caps.log2(new Decimal(200), new Decimal(100), new Decimal(0.1));
        expect(val.eq(110)).toBe(true);
    });

    test('coalesce stats add', () => {
        const stats = [
            { base: new Decimal(10), max: new Decimal(100) },
            { base: new Decimal(2) }
        ];
        const reg = getStatRegistration('hitpoints')!;
        const coalesced = coalesceStats(stats, reg);
        expect(coalesced.base && coalesced.base.eq(12)).toBe(true);
        expect(coalesced.max && coalesced.max.eq(100)).toBe(true);
    });

    test('coalesce stats complex', () => {
        const stats: StatStorage[] = [
            { base: new Decimal(10), max: new Decimal(20), min: new Decimal(0) },
            { percentTier0: new Decimal(10) },
            { percentTier0: new Decimal(3) },
            { percentTier1: new Decimal(5) },
            { base: new Decimal(5) },
            { percentTier1: new Decimal(1), base: new Decimal(1) },
            { percentCompounding: new Decimal(10) },
            { percentCompounding: new Decimal(5) },
            { percentCompounding: new Decimal(1) },
            { max: new Decimal(20) }
        ];
        const reg = getStatRegistration('hitpoints')!;
        const coalesced = coalesceStats(stats, reg);

        expect(coalesced.base && coalesced.base.eq(16)).toBe(true);
        expect(coalesced.percentTier0 && coalesced.percentTier0.eq(13)).toBe(true);
        expect(coalesced.percentTier1 && coalesced.percentTier1.eq(6)).toBe(true);
        expect(coalesced.percentCompounding && coalesced.percentCompounding).toStrictEqual([
            new Decimal(10),
            new Decimal(5),
            new Decimal(1)
        ]);
        expect(coalesced.max && coalesced.max.eq(40)).toBe(true);
        expect(coalesced.min && coalesced.min.eq(0)).toBe(true);
    });

    test('compute stat', () => {
        const stat: StatCoalesced = {
            base: new Decimal(10),
            percentTier0: new Decimal(10),
            percentTier1: new Decimal(5),
            percentCompounding: [new Decimal(10), new Decimal(5), new Decimal(1)],
            max: new Decimal(20),
            min: new Decimal(0)
        };
        const reg = getStatRegistration('hitpoints')!;
        const computed = computeStat(stat, reg);
        expect(computed.eq('13.4736525')).toBe(true);
    });

});