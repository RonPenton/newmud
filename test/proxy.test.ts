import Decimal from "decimal.js";
import { findIterable } from "tsc-utils";
import { getUniverseStorage } from "./fixtures/db1";
import { loadModelFiles } from "../src/server/models";
import { UniverseManager } from "../src/server/universe/universe";

declare module "../src/server/models/definitions/actor" {
    interface ActorProperties { 
        customProperty?: number;
        customProperty2?: {
            customSubProperty?: Decimal;
        };
    }
}

describe('test', () => {

    beforeAll(async () => {
        await loadModelFiles();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test('proxy catches changes to basic properties.', async () => {


        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const sword = manager.getRecord('item', 1);
        expect(sword).not.toBeUndefined();

        sword!.name = "Mega Swoooord!";

        const changes = manager.getDirtyObjects()['item'];
        expect(changes.size).toBe(1);
        expect(changes.has(1)).toBe(true);

        // test the proxy object reflects the change.
        expect(sword!.name).toBe("Mega Swoooord!");

        // test the underlying storage object reflects the change.
        expect(storage.item[0].name).toBe("Mega Swoooord!");
    });

    test('proxy catches changes to nested properties.', () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 2)!;
        expect(actor).not.toBeUndefined();

        actor.obj.x = 2000;

        const changes = manager.getDirtyObjects()['actor'];
        expect(changes.size).toBe(1);
        expect(changes.has(2)).toBe(true);

        expect(actor!.obj.x).toBe(2000);
        expect(storage.actor[1].obj.x).toBe(2000);
    });

    test('proxy returns mapped child types - iterator', () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();


        const items = Array.from(actor.items.values());

        expect(items.length).toBe(1);
        expect(items[0].name).toBe('Sword!');
    });

    test('proxy returns mapped child types - direct', () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 1);
        expect(actor).not.toBeUndefined();

        const sword = manager.getRecord('item', 1);
        expect(sword).not.toBeUndefined();

        const has = actor!.items.has(sword!);

        expect(has).toBe(true);
    });

    test('proxy sets mapped child types', () => {
        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const shield = manager.getRecord('item', 2)!;
        expect(shield).not.toBeUndefined();


        let hasShield = actor.items.has(shield);
        expect(hasShield).toBe(false);

        shield.actor = actor;

        hasShield = actor.items.has(shield);
        console.log(actor.items);
        expect(hasShield).toBe(true);

        const changes = manager.getDirtyObjects()['item'];
        expect(changes.size).toBe(1);
        expect(changes.has(2)).toBe(true);

        expect(actor.items.size).toBe(2);
    });

    test('proxy sets mapped child types and monitors changes', () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const hero = manager.getRecord('actor', 1)!;
        expect(hero).not.toBeUndefined();

        const shield = manager.getRecord('item', 2)!;
        expect(shield).not.toBeUndefined();

        const sword = manager.getRecord('item', 1)!;
        expect(sword).not.toBeUndefined();


        let hasShield = hero.items.has(shield);
        expect(hasShield).toBe(false);

        shield.actor = hero;

        hasShield = hero.items.has(shield);
        expect(hasShield).toBe(true);

        const changes = manager.getDirtyObjects()['item'];
        expect(changes.size).toBe(1);
        expect(changes.has(shield.id)).toBe(true);

        const item = findIterable(hero.items.values(), x => x.name == shield.name)!;
        expect(item).not.toBeUndefined();

        item.cost = new Decimal(30);

        expect(changes.size).toBe(1);
        expect(changes.has(shield.id)).toBe(true);

        expect(shield.cost.eq(30)).toBe(true);
        expect(storage.item[1].cost.eq(30)).toBe(true);
    });

    test('proxy deletes mapped child types', () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const hero = manager.getRecord('actor', 1)!;
        expect(hero).not.toBeUndefined();

        const shield = manager.getRecord('item', 2)!;
        expect(shield).not.toBeUndefined();

        const sword = manager.getRecord('item', 1)!;
        expect(sword).not.toBeUndefined();

        shield.actor = hero;
        var hasShield = hero.items.has(shield);
        expect(hasShield).toBe(true);

        const changes = manager.getDirtyObjects()['item'];
        expect(changes.size).toBe(1);
        expect(changes.has(shield.id)).toBe(true);

        shield.actor = null;
        hasShield = hero.items.has(shield);
        expect(hasShield).toBe(false);
        expect(changes.size).toBe(1);

        sword.actor = null;
        var hasSword = hero.items.has(sword);
        expect(hasSword).toBe(false);
        expect(changes.size).toBe(2);
        expect(changes.has(sword.id)).toBe(true);

        const items = Array.from(hero.items.values());
        expect(items.length).toBe(0);
    });

    test('proxy catches changes to extendible properties.', () => {


        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const changes = manager.getDirtyObjects()['actor'];

        expect(actor.properties).not.toBeUndefined();
        expect(actor.properties.customProperty).toBeUndefined();
        expect(changes.size).toBe(0);

        actor.properties.customProperty = 2000;

        expect(actor.properties.customProperty).toBe(2000);
        expect(changes.size).toBe(1);
        expect(changes.has(1)).toBe(true);

        expect(storage.actor[0].properties.customProperty).toBe(2000);
    });

    test('proxy catches changes to extendible sub-properties.', () => {
        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 2)!;
        expect(actor).not.toBeUndefined();

        const changes = manager.getDirtyObjects()['actor'];

        expect(actor.properties).not.toBeUndefined();
        expect(actor.properties.customProperty2!.customSubProperty!.eq(100)).toBe(true);
        expect(changes.size).toBe(0);

        actor.properties.customProperty2!.customSubProperty = new Decimal('100.000000000000001');

        expect(actor.properties.customProperty2!.customSubProperty.eq('100.000000000000001')).toBe(true);
        expect(changes.size).toBe(1);
        expect(changes.has(2)).toBe(true);

        expect(storage.actor[1].properties.customProperty2!.customSubProperty!.eq('100.000000000000001')).toBe(true);
    });

});