import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName({
    name: 'actor',
    plural: 'actors'
});

const registration = registerModel({
    ...name,
    descriptor: {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        room: RTTI.modelPointer('room'),
        obj: RTTI.object({
            x: RTTI.of<number>(),
            y: RTTI.of<number>(),
            z: RTTI.of<number>(),
            sub: RTTI.object({
                a: RTTI.nullable(RTTI.of<number>()),
                b: RTTI.optional(RTTI.of<number>()),
                c: RTTI.readonly(RTTI.of<number>()),
            })
        })
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
