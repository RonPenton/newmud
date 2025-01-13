import Decimal from "decimal.js";
import { caps } from "../src/server/stats/softcap";
import { getStatRegistration, loadStatDefinitions, StatRegistration } from "../src/server/stats/Stats";
import { coalesceStats, computeStat, condenseStats, StatCoalesced, StatStorage } from "../src/server/stats/types";
import { StatCollectionStorage } from "../src/server/stats/collection";
import { getStatStorageProxy } from "../src/server/proxy/statStorageProxy";
import { loadModelFiles } from "../src/server/models";
import { getUniverseStorage } from "./fixtures/db1";
import { UniverseManager } from "../src/server/universe/universe";
import { loadLogicDefinitions } from "../src/server/extensibleLogic/load";

describe('test', () => {

    beforeAll(async () => {
        await loadModelFiles();
        await loadLogicDefinitions();
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
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(2), appliesAt: 'base', scope: 'actor' }
        ];
        const coalesced = coalesceStats(stats);
        expect(coalesced.value && coalesced.value.eq(12)).toBe(true);
    });

    test('coalesce stats complex', () => {
        const stats: StatStorage[] = [
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
        ];
        const coalesced = coalesceStats(stats);

        expect(coalesced.value && coalesced.value.eq(16)).toBe(true);
        expect(coalesced.percent0 && coalesced.percent0.eq(13)).toBe(true);
        expect(coalesced.percent1 && coalesced.percent1.eq(6)).toBe(true);
        expect(coalesced.percentX && coalesced.percentX.eq(16.655)).toBe(true);
    });

    test('compute stat', () => {
        const stats: StatStorage[] = [
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
        ];

        const computed = computeStat(stats);
        expect(computed.eq('22.35669744')).toBe(true);
    });

    test('condense stats basic', () => {
        const stats: StatStorage[] = [
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
        ];

        const condensed = condenseStats(stats);
        expect(condensed.length).toBe(6);
        expect(condensed).toStrictEqual([
            { type: 'value', value: new Decimal(16), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(13), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(6), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' }
        ]);
    });

    test('condense stats with explanations', () => {
        const stats: StatStorage[] = [
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), explain: 'bonus from enchantment', appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(-2), explain: 'cursed by a warlock for stealing his bread', appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
        ];

        const condensed = condenseStats(stats);
        expect(condensed.length).toBe(8);
        expect(condensed).toStrictEqual([
            { type: 'value', value: new Decimal(16), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), explain: 'bonus from enchantment', appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(6), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(-2), explain: 'cursed by a warlock for stealing his bread', appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' }
        ]);
    });


    test('stat proxy gets empty stats', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {};
        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const proxy = getStatStorageProxy('actor', actor, storage.actor[0].baseStats, 'baseStats');

        expect(proxy.maxHitpoints).toBeDefined();
        const vals = [...proxy.maxHitpoints.raw()];
        expect(vals.length).toBe(0);
        expect(vals).toStrictEqual([]);

        // make sure no changes were made to the original object
        expect(storage.actor[0].baseStats).toStrictEqual({});
    });

    test('stat proxy gets existing stats', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };
        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const proxy = getStatStorageProxy('actor', actor, storage.actor[0].baseStats, 'baseStats');

        expect(proxy.maxHitpoints).toBeDefined();
        expect([...proxy.maxHitpoints.raw()]).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }
        ]);

        // make sure no changes were made to the original object
        expect(storage.actor[0].baseStats).toStrictEqual({
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        });
    });

    test('stat proxy sets new stat', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {};
        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const proxy = getStatStorageProxy('actor', actor, storage.actor[0].baseStats, 'baseStats');

        proxy.maxHitpoints.add({ type: 'value', appliesAt: 'base', scope: 'actor', value: new Decimal(10) });

        expect([...proxy.maxHitpoints.raw()]).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }
        ]);
        expect(storage.actor[0].baseStats).toStrictEqual({
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        });
    });

    test('stat proxy sets existing stat', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };
        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const proxy = getStatStorageProxy('actor', actor, storage.actor[0].baseStats, 'baseStats');

        proxy.maxHitpoints.add({ type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' });

        expect([...proxy.maxHitpoints.raw()]).toStrictEqual([
            { type: 'value', value: new Decimal(15), scope: 'actor', appliesAt: 'base' },
        ]);
        expect(storage.actor[0].baseStats).toStrictEqual({
            maxHitpoints: [
                { type: 'value', value: new Decimal(15), scope: 'actor', appliesAt: 'base' },
            ]
        });

        proxy.maxHitpoints.add(
            { type: 'value', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!', scope: 'actor', appliesAt: 'base' }
        );
        expect([...proxy.maxHitpoints.raw()]).toStrictEqual([
            { type: 'value', value: new Decimal(15), scope: 'actor', appliesAt: 'base' },
            { type: 'value', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!', scope: 'actor', appliesAt: 'base' }
        ]);
        expect(storage.actor[0].baseStats).toStrictEqual({
            maxHitpoints: [
                { type: 'value', value: new Decimal(15), scope: 'actor', appliesAt: 'base' },
                { type: 'value', value: new Decimal(15), explain: 'permanent buff for Blerbens Day!', scope: 'actor', appliesAt: 'base' }
            ]
        });
    });

    test('basic stat collection on entity', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = [...actor.baseStats.maxHitpoints.collect()];
        expect(result).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }
        ]);
    });

    test('adding stat collection on entity', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        actor.baseStats.maxHitpoints.add({ type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' });

        const result = [...actor.baseStats.maxHitpoints.collect()];
        expect(result).toStrictEqual([
            { type: 'value', value: new Decimal(15), scope: 'actor', appliesAt: 'base' }
        ]);
    });
});
