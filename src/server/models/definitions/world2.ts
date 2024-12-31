import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName(
    {
        name: 'world',
        plural: 'worlds',
    }
);

const registration = registerModel({
    ...name,
    descriptor: {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        time: RTTI.of<number>(),
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
