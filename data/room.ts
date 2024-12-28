import { Storage } from '../src/server/models';

const rooms: Storage<'room'>[] = [
    {
        id: 1,
        name: 'Town Square',
        exits: {
            north: {
                room: 2
            },
        }
    },
    {
        id: 2,
        name: 'Ironforge Street, North',
        exits: {
            south: {
                room: 1
            },
        }
    }
]