import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";

export const itemTemplateRegistration = registerModel({
    name: 'itemTemplate',
    plural: 'itemTemplates',
    descriptor: RTTI.object({
        ...defaultProperties('item'),
        equippedStats: RTTI.statCollectionStorage(),
    }),
    onChanges: {}
});
