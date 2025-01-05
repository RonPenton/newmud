import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";

/**
 * A collection of properties free-form properties
 * that can be attached to an actor by various scripts.
 */
export interface ActorProperties {

}

export const actorRegistration = registerModel({
    name: 'actor',
    plural: 'actors',
    descriptor: RTTI.object({
        ...defaultProperties('actor'),
        room: RTTI.ownedBy('room'),
        obj: RTTI.object({
            x: RTTI.of<number>(),
            y: RTTI.of<number>(),
            z: RTTI.of<number>(),
            sub: RTTI.object({
                a: RTTI.nullable(RTTI.of<number>()),
                b: RTTI.optional(RTTI.of<number>()),
                c: RTTI.readonly(RTTI.of<number>())
            })
        }),
        properties: RTTI.properties<ActorProperties>(),
        items: RTTI.ownedCollection('item'),
    }),
    onChanges: {}
});
