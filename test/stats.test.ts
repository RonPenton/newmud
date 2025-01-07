import Decimal from "decimal.js";
import { coalesceStats, computeStat, StatCoalesced, StatStorage } from "../src/server/stats/types";
import { caps } from "../src/server/stats/softcap";
import { getStatRegistration, loadStatDefinitions } from "../src/server/stats/Stats";
import { StatCollectionStorage } from "../src/server/stats/collection";
import { getStatStorageProxy } from "../src/server/proxy/statStorageProxy";

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

    test('coalesce stats identity', () => {
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

        const stats2: StatStorage[] = [
            {},
            { base: new Decimal(10), max: new Decimal(20), min: new Decimal(0) },
            { percentTier0: new Decimal(10) },
            { percentTier0: new Decimal(3) },
            {},
            { percentTier1: new Decimal(5) },
            { base: new Decimal(5) },
            { percentTier1: new Decimal(1), base: new Decimal(1) },
            {},
            { percentCompounding: new Decimal(10) },
            { percentCompounding: new Decimal(5) },
            {},
            { percentCompounding: new Decimal(1) },
            { max: new Decimal(20) },
            {}
        ];
        const coalesced2 = coalesceStats(stats2, reg);

        expect(coalesced2.base && coalesced2.base.eq(16)).toBe(true);
        expect(coalesced2.percentTier0 && coalesced2.percentTier0.eq(13)).toBe(true);
        expect(coalesced2.percentTier1 && coalesced2.percentTier1.eq(6)).toBe(true);
        expect(coalesced2.percentCompounding && coalesced2.percentCompounding).toStrictEqual([
            new Decimal(10),
            new Decimal(5),
            new Decimal(1)
        ]);
        expect(coalesced2.max && coalesced2.max.eq(40)).toBe(true);
        expect(coalesced2.min && coalesced2.min.eq(0)).toBe(true);
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

    test('stat proxy gets empty stats', () => {
        const stats: StatCollectionStorage = {};
        const proxy = getStatStorageProxy(stats);

        expect(proxy.hitpoints).toBeDefined();
        expect(proxy.hitpoints.base.eq(0)).toBe(true);

        // make sure no changes were made to the original object
        expect(stats).toStrictEqual({});
    });

    test('stat proxy gets existing stats', () => {
        const stats: StatCollectionStorage = {
            hitpoints: {
                base: new Decimal(10)
            }
        };
        const proxy = getStatStorageProxy(stats);

        expect(proxy.hitpoints).toBeDefined();
        expect(proxy.hitpoints.base.eq(10)).toBe(true);

        // make sure no changes were made to the original object
        expect(stats).toStrictEqual({
            hitpoints: {
                base: new Decimal(10)
            }
        });
    });

    test('stat proxy sets new stat', () => {
        const stats: StatCollectionStorage = {};
        const proxy = getStatStorageProxy(stats);

        const chain = proxy.hitpoints.base = new Decimal(10);

        expect(chain.eq(10)).toBe(true);
        expect(proxy.hitpoints.base.eq(10)).toBe(true);
        expect(stats).toStrictEqual({
            hitpoints: {
                base: new Decimal(10)
            }
        });
    });

    test('stat proxy sets existing stat', () => {
        const stats: StatCollectionStorage = {
            hitpoints: {
                base: new Decimal(10)
            }
        };
        const proxy = getStatStorageProxy(stats);

        const chain = proxy.hitpoints.base = proxy.hitpoints.base.add(10);
        proxy.hitpoints.max = new Decimal(30);

        const empty = proxy.hitpoints.min;

        expect(empty.eq(0)).toBe(true);
        expect(chain.eq(20)).toBe(true);
        expect(proxy.hitpoints.base.eq(20)).toBe(true);
        expect(proxy.hitpoints.max.eq(30)).toBe(true);
        expect(stats).toStrictEqual({
            hitpoints: {
                base: new Decimal(20),
                max: new Decimal(30)
            }
        });
    });

});