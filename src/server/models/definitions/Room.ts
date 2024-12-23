import { RTTI } from "../../rtti";
// import { Directions } from "../../utils/direction";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName(
    {
        name: 'room',
        plural: 'rooms',
    }
);

const registration = registerModel({
    ...name,
    descriptor: {
        id: RTTI.id(),
        name: RTTI.of<string>(),
        // exits: RTTI.recordOfModel(Directions, 'exit'),
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
