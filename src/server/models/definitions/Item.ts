import Decimal from "decimal.js";
import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName({
    name: 'item',
    plural: 'items',
});

const registration = registerModel({
    ...name,
    descriptor: {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        room: RTTI.nullable(RTTI.modelPointer('room')),
        actor: RTTI.nullable(RTTI.modelPointer('actor')),
        cost: RTTI.of<Decimal>(),
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
