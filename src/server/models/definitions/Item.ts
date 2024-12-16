import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName('item');

const registration = registerModel({
    name,
    plural: 'items',
    descriptor: {
        id: RTTI.of<number>(),
        name: RTTI.of<string>(),
        room: RTTI.optional(RTTI.modelPointer('room')),
        actor: RTTI.optional(RTTI.modelPointer('actor')),
    },
    isDatabaseModel: true,
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
