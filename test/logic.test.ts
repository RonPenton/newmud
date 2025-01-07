import Decimal from "decimal.js";
import { findIterable } from "tsc-utils";
import { getUniverseStorage } from "./fixtures/db1";
import { UniverseManager } from "../src/server/universe/universe";
import '../src/server/models';
import { loadModelFiles } from "../src/server/models";
import { loadLogicDefinitions } from "../src/server/extensibleLogic/load";

import { getModelScript } from "../src/server/scriptEngine/loadScript";
import { makeScript } from "../src/server/extensibleLogic/types";

// mock getModelScript
jest.mock('../src/server/scriptEngine/loadScript');
const mockedGetModelScript = getModelScript as jest.Mock;
// implementation of getModelScript
mockedGetModelScript.mockImplementation((type: string, name: string) => {

    if (type == 'room' && name == 'blocked') {
        return makeScript('room', {
            canEnter: (_, aggregate) => aggregate && false
        });
    }
    if (type == 'room' && name == 'allowPlayerOne') {
        return makeScript('room', {
            canEnter: ({ actor }, aggregate) => aggregate && actor.id == 1
        });
    }

    return null;
});

describe('test', () => {

    beforeAll(async () => {
        await loadModelFiles();
        await loadLogicDefinitions();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test('logic proxy executes with default value.', async () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const room1 = manager.getRecord('room', 1)!;
        expect(room1).not.toBeUndefined();
        const room2 = manager.getRecord('room', 2)!;
        expect(room2).not.toBeUndefined();

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const succeed = room2.logic.canEnter({
            actor: manager.getRecord('actor', 1)!,
            startingRoom: room1,
            destinationRoom: room2,
            direction: 'north',
            exit: room1.exits.north!
        });

        expect(succeed).toBe(true);
    });

    test('logic proxy executes script.', async () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const room1 = manager.getRecord('room', 1)!;
        expect(room1).not.toBeUndefined();
        const room3 = manager.getRecord('room', 3)!;
        expect(room3).not.toBeUndefined();

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const succeed = room3.logic.canEnter({
            actor: manager.getRecord('actor', 1)!,
            startingRoom: room1,
            destinationRoom: room3,
            direction: 'north',
            exit: room1.exits.north!
        });

        expect(succeed).toBe(false);
    });

    test('logic proxy executes more complex script.', async () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const room1 = manager.getRecord('room', 1)!;
        expect(room1).not.toBeUndefined();
        const room4 = manager.getRecord('room', 4)!;
        expect(room4).not.toBeUndefined();

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const actor2 = manager.getRecord('actor', 2)!;
        expect(actor2).not.toBeUndefined();

        const first = room4.logic.canEnter({
            actor: actor,
            startingRoom: room1,
            destinationRoom: room4,
            direction: 'north',
            exit: room1.exits.north!
        });

        expect(first).toBe(true);

        const second = room4.logic.canEnter({
            actor: actor2,
            startingRoom: room1,
            destinationRoom: room4,
            direction: 'north',
            exit: room1.exits.north!
        });

        expect(second).toBe(false);
    });

    test('logic proxy executes script chain.', async () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const room1 = manager.getRecord('room', 1)!;
        expect(room1).not.toBeUndefined();
        const room5 = manager.getRecord('room', 5)!;
        expect(room5).not.toBeUndefined();

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const first = room5.logic.canEnter({
            actor: actor,
            startingRoom: room1,
            destinationRoom: room5,
            direction: 'north',
            exit: room1.exits.north!
        });

        expect(first).toBe(false);
    });


});