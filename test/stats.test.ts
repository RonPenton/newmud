import Decimal from "decimal.js";
import { caps } from "../src/server/stats/softcap";
import { getStatMaxRegistration, getStatRegistration, loadStatDefinitions, StatRegistration } from "../src/server/stats/Stats";
import { coalesceStats, computeStat, condenseStats, StatStorage } from "../src/server/stats/types";
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

    test('condense stats with different scopes and bases', () => {
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
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'item' },
            { type: 'value', value: new Decimal(5), appliesAt: 'total', scope: 'item' },
        ];

        const condensed = condenseStats(stats);
        expect(condensed.length).toBe(10);
        expect(condensed).toStrictEqual([
            { type: 'value', value: new Decimal(16), appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(10), explain: 'bonus from enchantment', appliesAt: 'base', scope: 'actor' },
            { type: 'percent0', value: new Decimal(3), appliesAt: 'base', scope: 'actor' },
            { type: 'percent1', value: new Decimal(6), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(-2), explain: 'cursed by a warlock for stealing his bread', appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(10), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(5), appliesAt: 'base', scope: 'actor' },
            { type: 'percentX', value: new Decimal(1), appliesAt: 'base', scope: 'actor' },
            { type: 'value', value: new Decimal(10), appliesAt: 'base', scope: 'item' },
            { type: 'value', value: new Decimal(5), appliesAt: 'total', scope: 'item' },
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

    test('environmental stat collection', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };
        storage.world[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' }]
        };
        storage.area[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(2), scope: 'actor', appliesAt: 'base' }]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = [...actor.baseStats.maxHitpoints.collect()];
        expect(result).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            { type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' },
            { type: 'value', value: new Decimal(2), scope: 'actor', appliesAt: 'base' }
        ]);
    });

    test('sub-item stat collection passthrough', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };
        storage.item[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' }]
        };
        storage.item[0].actor = storage.actor[0].id;
        storage.item[0].room = null;

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = [...actor.baseStats.maxHitpoints.collect()];
        expect(result).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            { type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'base' },
        ]);
    });

    test('sub-item stat collection direct', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };
        storage.item[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(5), scope: 'item', appliesAt: 'base' }]
        };
        storage.item[0].actor = storage.actor[0].id;
        storage.item[0].room = null;

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = [...actor.baseStats.maxHitpoints.collect()];
        expect(result).toStrictEqual([
            { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            { type: 'value', value: new Decimal(5), scope: 'actor', appliesAt: 'total', explain: 'Sword!' },
        ]);
    });

    test('stat computation - no stat.', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.perception;
        expect(result.eq(0)).toBe(true);
    });

    test('stat computation - starting value.', () => {
        const reg: any = getStatRegistration('maxHitpoints');
        reg.startingValue = new Decimal(10);

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.maxHitpoints;
        expect(result.eq(10)).toBe(true);
    });

    test('stat computation - base values.', () => {
        const reg: any = getStatRegistration('maxHitpoints');
        reg.startingValue = new Decimal(10);

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [{ type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' }]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.maxHitpoints;
        expect(result.eq(20)).toBe(true);
    });

    test('stat computation - base values with percentages', () => {
        const reg: any = getStatRegistration('maxHitpoints');
        reg.startingValue = new Decimal(10);

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [
                { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
                { type: 'percent0', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            ]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.maxHitpoints;
        expect(result.eq(22)).toBe(true);
    });

    test('stat computation - value rounding', () => {
        const reg: any = getStatRegistration('maxHitpoints');
        reg.startingValue = new Decimal(10);

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [
                { type: 'value', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
                { type: 'percent0', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
                { type: 'percentX', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            ]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.maxHitpoints;
        expect(result.eq(24)).toBe(true);   // not 24.2. 
    });

    test('stat computation - maximum value simple, hardcap', () => {
        const reg: any = getStatRegistration('maxHitpoints');
        reg.max = new Decimal(100);
        reg.capType = 'hard';

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [
                { type: 'value', value: new Decimal(90), scope: 'actor', appliesAt: 'base' },
                { type: 'percent0', value: new Decimal(50), scope: 'actor', appliesAt: 'base' },
            ]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const result = actor.stats.maxHitpoints;
        expect(result.eq(100)).toBe(true);
    });

    test('stat computation - maximum value, softcap', () => {

        const reg: any = getStatRegistration('maxHitpoints');
        reg.max = new Decimal(100);
        reg.capType = 'log2';
        reg.softcapScale = new Decimal(0.5);

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            maxHitpoints: [
                { type: 'value', value: new Decimal(90), scope: 'actor', appliesAt: 'base' },
                { type: 'percent0', value: new Decimal(50), scope: 'actor', appliesAt: 'base' },
            ]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        // maxHitpoints = 90 + 50% = 135
        // cap = 100
        // factor = 0.5 * cap = 50
        // log2(135 / 100) = ~0.43 * 50 = ~21.6
        // 100 + 21.6 = 121.6
        // floor-> 121

        const result = actor.stats.maxHitpoints;
        expect(result.eq(121)).toBe(true);
    });

    test('stat computation - with separate max stat, hardcap', () => {

        const reg: any = getStatRegistration('perception');
        reg.initialValue = new Decimal(0);
        reg.max = undefined;
        reg.capType = 'hard';
        reg.computer = undefined;

        const maxReg: any = getStatMaxRegistration('perception');
        maxReg.max = undefined;
        maxReg.min = undefined;
        maxReg.capType = 'none';        

        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            perception: [
                { type: 'value', value: new Decimal(50), scope: 'actor', appliesAt: 'base' }
            ],
            maxPerception: [
                { type: 'value', value: new Decimal(100), scope: 'actor', appliesAt: 'base' }
            ]
        };

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        expect(actor.stats.perception.eq(50)).toBe(true);
        expect(actor.stats.maxPerception.eq(100)).toBe(true);

        actor.baseStats.perception.add({ type: 'value', value: new Decimal(100), scope: 'actor', appliesAt: 'base' });

        expect(actor.stats.perception.eq(100)).toBe(true);

        actor.baseStats.maxPerception.add({ type: 'value', value: new Decimal(100), scope: 'actor', appliesAt: 'base' });

        expect(actor.stats.maxPerception.eq(200)).toBe(true);
        expect(actor.stats.perception.eq(150)).toBe(true);
    });

    test('stat computation - actor with item', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            strength: [
                { type: 'value', value: new Decimal(50), scope: 'actor', appliesAt: 'base' }
            ]
        };
        storage.item[0].room = 1;
        storage.item[0].actor = null;
        storage.item[0].baseStats = {
            strength: [
                { type: 'value', value: new Decimal(10), scope: 'item', appliesAt: 'base' }
            ]
        }

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const item = manager.getRecord('item', 1)!;
        expect(item).not.toBeUndefined();

        expect(actor.stats.strength.eq(50)).toBe(true);

        item.actor = actor;

        expect(actor.stats.strength.eq(60)).toBe(true);
    });

    test('stat computation - weight', () => {
        const storage = getUniverseStorage();
        storage.actor[0].baseStats = {
            weight: [
                { type: 'value', value: new Decimal(100), scope: 'actor', appliesAt: 'base' }
            ]
        };
        storage.item[0].room = 1;
        storage.item[0].actor = null;
        storage.item[0].baseStats = {
            weight: [
                { type: 'value', value: new Decimal(10), scope: 'item', appliesAt: 'base' }
            ]
        }

        const manager = new UniverseManager(storage);
        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const item = manager.getRecord('item', 1)!;
        expect(item).not.toBeUndefined();

        expect(actor.stats.weight.eq(100)).toBe(true);

        item.actor = actor;

        expect(actor.stats.weight.eq(110)).toBe(true);

        actor.room.baseStats.weight.add({ type: 'percent0', value: new Decimal(10), scope: 'actor', appliesAt: 'base' });
        actor.room.baseStats.weight.add({ type: 'percent0', value: new Decimal(10), scope: 'item', appliesAt: 'base' });

        expect(storage.room[0].baseStats.weight).toStrictEqual([
            { type: 'percent0', value: new Decimal(10), scope: 'actor', appliesAt: 'base' },
            { type: 'percent0', value: new Decimal(10), scope: 'item', appliesAt: 'base' }
        ]);

        expect(actor.stats.weight.eq(121)).toBe(true);

        actor.room.baseStats.weight.add({ type: 'percent0', value: new Decimal(10), scope: 'item', appliesAt: 'base' });

        expect(actor.stats.weight.eq(122)).toBe(true);
    });





});
