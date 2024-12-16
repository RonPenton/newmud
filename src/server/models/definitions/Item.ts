import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName({
    name: 'item',
    plural: 'items',
    isDatabaseModel: true,
});

const registration = registerModel({
    ...name,
    descriptor: {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        room: RTTI.optional(RTTI.modelPointer('room')),
        actor: RTTI.optional(RTTI.modelPointer('actor')),
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
