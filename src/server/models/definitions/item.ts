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
    }),
    onChanges: {
        room: (item, room) => {
            if(room !== null) {
                item.actor = null;
            }
            return room;
        },
        actor: (item, actor) => {
            if(actor !== null) {
                item.room = null;
            }
            return actor;
        },
    }
});
