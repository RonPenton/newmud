import { RTTI } from "../../rtti";
import { Directions } from "../../utils/direction";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";

const name = registerModelName(
    {
        name: 'room',
        plural: 'rooms',
    }
);

export const ExitDefinition = RTTI.object({
    room: RTTI.modelPointer('room').nullable().readonly(),
    portal: RTTI.modelPointer('portal').optional().readonly(),
});

const registration = registerModel(
    name,
    {
        exits: RTTI.partialRecord(
            Directions,
            ExitDefinition
        )
    }
);

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
