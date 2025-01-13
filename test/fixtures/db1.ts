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
            logic: [],
            baseStats: {}
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
            logic: [],
            baseStats: {}
        }],
        item: [
            {
                id: 1,
                name: 'Sword!',
                actor: 1,
                room: null,
                itemTemplate: 1,
                logic: [],
                baseStats: {},
                equippedStats: {}
            },
            {
                id: 2,
                name: 'Shield!',
                actor: 2,
                room: null,
                itemTemplate: 1,
                logic: [],
                baseStats: {},
                equippedStats: {}
            }
        ],
        room: [
            {
                id: 1,
                name: 'test room',
                exits: {
                    'north': {
                        room: 2
                    }
                },
                logic: [],
                area: 1,
                baseStats: {}
            },
            {
                id: 2,
                name: 'test room 2',
                exits: {
                    'south': {
                        room: 1
                    }
                },
                logic: [],
                area: 1,
                baseStats: {}
            },
            {
                id: 3,
                name: 'test room 3',
                exits: {
                    'west': {
                        room: 1
                    }
                },
                logic: [{ name: 'blocked' }],
                area: 1,
                baseStats: {}
            },
            {
                id: 4,
                name: 'test room 4',
                exits: {
                    'east': {
                        room: 1
                    }
                },
                logic: [{ name: 'allowPlayerOne' }],
                area: 1,
                baseStats: {}
            },
            {
                id: 5,
                name: 'test room 5',
                exits: {
                    'west': {
                        room: 1
                    }
                },
                logic: [{ name: 'allowPlayerOne' }, { name: 'blocked' }],
                area: 1,
                baseStats: {}
            }
        ],
        //portal: [],
        world: [{
            id: 1,
            name: 'the world',
            logic: [],
            baseStats: {}
        }],
        region: [{
            id: 1,
            name: 'test region',
            world: 1,
            logic: [],
            baseStats: {}
        }],
        area: [{
            id: 1,
            name: 'test area',
            region: 1,
            logic: [],
            baseStats: {}
        }],
        itemTemplate: [{
            id: 1,
            name: 'sword',
            logic: [],
            baseStats: {},
            equippedStats: {}
        }]
    };
}
