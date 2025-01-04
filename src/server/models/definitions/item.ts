import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { itemTemplateRegistration } from "./itemTemplate";

export const itemRegistration = registerModel({
    name: 'item',
    plural: 'items',
    descriptor: RTTI.object({
        ...itemTemplateRegistration.descriptor.object,
        room: RTTI.nullable(RTTI.ownedBy('room')),
        actor: RTTI.nullable(RTTI.ownedBy('actor')),
        itemTemplate: RTTI.templatedFrom('itemTemplate'),
    })
});
