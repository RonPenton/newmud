import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName({
    name: 'actor',
    plural: 'actors'
});

/**
 * A collection of properties free-form properties
 * that can be attached to an actor by various scripts.
 */
export interface ActorProperties {

}

const registration = registerModel(
    name,
    {
        room: RTTI.ownedBy('room'),
        obj: RTTI.object({
            x: RTTI.of<number>(),
            y: RTTI.of<number>(),
            z: RTTI.of<number>(),
            sub: RTTI.object({
                a: RTTI.of<number>().nullable(),
                b: RTTI.of<number>().optional(),
                c: RTTI.of<number>().readonly(),
            })
        }),
        properties: RTTI.properties<ActorProperties>(),
    }
);

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
