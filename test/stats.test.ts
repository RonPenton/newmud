import Decimal from "decimal.js";
import { caps } from "../src/server/stats/softcap";
import { getStatRegistration, loadStatDefinitions, StatRegistration } from "../src/server/stats/Stats";
import { coalesceStats, computeStat, condenseStats, StatCoalesced, StatStorage } from "../src/server/stats/types";
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
        const stats: StatStorage[] = [
            { type: 'base', value: new Decimal(10) },
            { type: 'max', value: new Decimal(100) },
            { type: 'base', value: new Decimal(2) }
        ];
        const reg = getStatRegistration('hitpoints')!;
        const coalesced = coalesceStats(stats, reg);
        expect(coalesced.base && coalesced.base.eq(12)).toBe(true);
        expect(coalesced.max && coalesced.max.eq(100)).toBe(true);
    });

    test('coalesce stats complex', () => {
        const stats: StatStorage[] = [
            { type: 'base', value: new Decimal(10) },
            { type: 'max', value: new Decimal(20) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(10) },
            { type: 'percentTier0', value: new Decimal(3) },
            { type: 'percentTier1', value: new Decimal(5) },
            { type: 'base', value: new Decimal(5) },
            { type: 'percentTier1', value: new Decimal(1) },
            { type: 'base', value: new Decimal(1) },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) },
            { type: 'max', value: new Decimal(20) }
        ];
        const reg = getStatRegistration('hitpoints')!;
        const coalesced = coalesceStats(stats, reg);

        expect(coalesced.base && coalesced.base.eq(16)).toBe(true);
        expect(coalesced.percentTier0 && coalesced.percentTier0.eq(13)).toBe(true);
        expect(coalesced.percentTier1 && coalesced.percentTier1.eq(6)).toBe(true);
        expect(coalesced.percentCompounding && coalesced.percentCompounding.eq(16.655)).toBe(true);
        expect(coalesced.max && coalesced.max.eq(40)).toBe(true);
        expect(coalesced.min && coalesced.min.eq(0)).toBe(true);
    });

    test('compute stat', () => {
        const stats: StatStorage[] = [
            { type: 'base', value: new Decimal(10) },
            { type: 'max', value: new Decimal(20) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(10) },
            { type: 'percentTier0', value: new Decimal(3) },
            { type: 'percentTier1', value: new Decimal(5) },
            { type: 'base', value: new Decimal(5) },
            { type: 'percentTier1', value: new Decimal(1) },
            { type: 'base', value: new Decimal(1) },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) },
            { type: 'max', value: new Decimal(20) }
        ];

        const reg = getStatRegistration('hitpoints')!;
        const computed = computeStat(stats, reg);
        expect(computed.eq('22.35669744')).toBe(true);
    });

    test('condense stats basic', () => {
        const stats: StatStorage[] = [
            { type: 'base', value: new Decimal(10) },
            { type: 'max', value: new Decimal(20) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(10) },
            { type: 'percentTier0', value: new Decimal(3) },
            { type: 'percentTier1', value: new Decimal(5) },
            { type: 'base', value: new Decimal(5) },
            { type: 'percentTier1', value: new Decimal(1) },
            { type: 'base', value: new Decimal(1) },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) },
            { type: 'max', value: new Decimal(20) }
        ];

        const condensed = condenseStats(stats);
        expect(condensed.length).toBe(8);
        expect(condensed).toStrictEqual([
            { type: 'base', value: new Decimal(16) },
            { type: 'max', value: new Decimal(40) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(13) },
            { type: 'percentTier1', value: new Decimal(6) },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) }
        ]);
    });

    test('condense stats with explanations', () => {
        const stats: StatStorage[] = [
            { type: 'base', value: new Decimal(10) },
            { type: 'max', value: new Decimal(20) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(10), explain: 'bonus from enchantment' },
            { type: 'percentTier0', value: new Decimal(3) },
            { type: 'percentTier1', value: new Decimal(5) },
            { type: 'base', value: new Decimal(5) },
            { type: 'percentTier1', value: new Decimal(1) },
            { type: 'base', value: new Decimal(1) },
            { type: 'base', value: new Decimal(-2), explain: 'cursed by a warlock for stealing his bread' },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) },
            { type: 'max', value: new Decimal(20) }
        ];

        const condensed = condenseStats(stats);
        expect(condensed.length).toBe(10);
        expect(condensed).toStrictEqual([
            { type: 'base', value: new Decimal(16) },
            { type: 'max', value: new Decimal(40) },
            { type: 'min', value: new Decimal(0) },
            { type: 'percentTier0', value: new Decimal(10), explain: 'bonus from enchantment' },
            { type: 'percentTier0', value: new Decimal(3) },
            { type: 'percentTier1', value: new Decimal(6) },
            { type: 'base', value: new Decimal(-2), explain: 'cursed by a warlock for stealing his bread' },
            { type: 'percentCompounding', value: new Decimal(10) },
            { type: 'percentCompounding', value: new Decimal(5) },
            { type: 'percentCompounding', value: new Decimal(1) }
        ]);
    });


    test('stat proxy gets empty stats', () => {
        const stats: StatCollectionStorage = {};
        const proxy = getStatStorageProxy(stats);

        expect(proxy.hitpoints).toBeDefined();
        const vals = [...proxy.hitpoints];
        expect(vals.length).toBe(0);
        expect(vals).toStrictEqual([]);

        // make sure no changes were made to the original object
        expect(stats).toStrictEqual({});
    });

    test('stat proxy gets existing stats', () => {
        const stats: StatCollectionStorage = {
            hitpoints: [{ type: 'base', value: new Decimal(10) }]
        };
        const proxy = getStatStorageProxy(stats);

        expect(proxy.hitpoints).toBeDefined();
        expect([...proxy.hitpoints]).toStrictEqual([{ type: 'base', value: new Decimal(10) }]);

        // make sure no changes were made to the original object
        expect(stats).toStrictEqual({
            hitpoints: [{ type: 'base', value: new Decimal(10) }]
        });
    });

    test('stat proxy sets new stat', () => {
        const stats: StatCollectionStorage = {};
        const proxy = getStatStorageProxy(stats);

        proxy.hitpoints.add({ type: 'base', value: new Decimal(10) });

        expect([...proxy.hitpoints]).toStrictEqual([{ type: 'base', value: new Decimal(10) }]);
        expect(stats).toStrictEqual({
            hitpoints: [{ type: 'base', value: new Decimal(10) }]
        });
    });

    test('stat proxy sets existing stat', () => {
        const stats: StatCollectionStorage = {
            hitpoints: [{ type: 'base', value: new Decimal(10) }]
        };
        const proxy = getStatStorageProxy(stats);

        proxy.hitpoints.add({ type: 'base', value: new Decimal(5) });
        proxy.hitpoints.add({ type: 'max', value: new Decimal(30) });

        expect([...proxy.hitpoints]).toStrictEqual([
            { type: 'base', value: new Decimal(15) },
            { type: 'max', value: new Decimal(30) }
        ]);
        expect(stats).toStrictEqual({
            hitpoints: [
                { type: 'base', value: new Decimal(15) },
                { type: 'max', value: new Decimal(30) }
            ]
        });

        proxy.hitpoints.add({ type: 'base', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!' });
        expect([...proxy.hitpoints]).toStrictEqual([
            { type: 'base', value: new Decimal(15) },
            { type: 'max', value: new Decimal(30) },
            { type: 'base', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!' }
        ]);
        expect(stats).toStrictEqual({
            hitpoints: [
                { type: 'base', value: new Decimal(15) },
                { type: 'max', value: new Decimal(30) },
                { type: 'base', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!' }
            ]
        });
    });

});
