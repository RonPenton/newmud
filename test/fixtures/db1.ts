import Decimal from "decimal.js";
import { UniverseStorage } from "../../src/server/universe/universe";

export function getUniverseStorage(): UniverseStorage {
    return {
        actor: [{
            id: 1,
            name: 'actor 1',
            room: 1,
            obj: {
                x: 1,
                y: 2,
                z: 3,
                sub: {
                    a: 4,
                    b: 5,
                    c: 6
                }
            },
            properties: {

            },
            logic: []
        },
        {
            id: 2,
            name: 'actor 2',
            room: 1,
            obj: {
                x: 1,
                y: 2,
                z: 3,
                sub: {
                    a: 4,
                    b: 5,
                    c: 6
                }
            },
            properties: {
                customProperty2: {
                    customSubProperty: new Decimal(100)
                }
            },
            logic: []
        }],
        item: [
            {
                id: 1,
                name: 'Sword!',
                actor: 1,
                room: null,
                cost: new Decimal(10),
                itemTemplate: 0,
                logic: []
            },
            {
                id: 2,
                name: 'Shield!',
                actor: 2,
                room: null,
                cost: new Decimal(5),
                itemTemplate: 0,
                logic: []
            }
        ],
        room: [{
            id: 1,
            name: 'test room',
            exits: {},
            logic: []
        }],
        //portal: [],
        //world: [],
        itemTemplate: []
    };
}
