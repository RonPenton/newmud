import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName('actor');

const registration = registerModel({
    name,
    plural: 'actors',
    descriptor: {
        id: RTTI.of<number>(),
        name: RTTI.of<string>(),
        room: RTTI.modelPointer('room'),
    },
    isDatabaseModel: true,
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
