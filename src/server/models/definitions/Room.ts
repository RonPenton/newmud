import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName('room');

const registration = registerModel({
    name,
    plural: 'rooms',
    descriptor: {
        id: RTTI.of<number>(),
        name: RTTI.of<string>(),
    },
    isDatabaseModel: true,
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
