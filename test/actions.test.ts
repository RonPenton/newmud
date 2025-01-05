import Decimal from "decimal.js";
import { findIterable } from "tsc-utils";
import { getUniverseStorage } from "./fixtures/db1";
import { UniverseManager } from "../src/server/universe/universe";
import '../src/server/models';
import { loadModelFiles } from "../src/server/models";
import { loadLogicDefinitions } from "../src/server/extensibleLogic/load";
import { Actions, loadActions } from "../src/server/actions/Actions";

describe('test', () => {

    beforeAll(async () => {
        await loadModelFiles();
        await loadLogicDefinitions();
        await loadActions();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test('move action.', async () => {

        const storage = getUniverseStorage();
        const manager = new UniverseManager(storage);

        const actor = manager.getRecord('actor', 1)!;
        expect(actor).not.toBeUndefined();

        const room1 = manager.getRecord('room', 1)!;
        expect(room1).not.toBeUndefined();

        const room2 = manager.getRecord('room', 2)!;
        expect(room2).not.toBeUndefined();

        Actions.actorMove({
            universe: manager,
            actor,
            direction: 'north'
        });

        expect(actor.room).toBe(room2);

        Actions.actorMove({
            universe: manager,
            actor,
            direction: 'east'
        });

        expect(actor.room).toBe(room2);

        Actions.actorMove({
            universe: manager,
            actor,
            direction: 'south'
        });

        expect(actor.room).toBe(room1);

    });

});