import { RTTI } from "../../rtti";
import { registerModelName } from "../ModelNames";
import { registerModel } from "../Models";
import { registration as itemTemplateRegistration } from "./itemTemplate";

const name = registerModelName({
    name: 'item',
    plural: 'items',
});

const registration = registerModel({
    ...name,
    descriptor: {
        ...itemTemplateRegistration.descriptor, // inherit base properties from itemTemplate

        room: RTTI.nullable(RTTI.ownedBy('room')),
        actor: RTTI.nullable(RTTI.ownedBy('actor')),
        itemTemplate: RTTI.templatedFrom('itemTemplate'),
    }
});

declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
