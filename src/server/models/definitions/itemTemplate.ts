import Decimal from "decimal.js";
import { RTTI } from "../../rtti";
import { registerModel } from "../Models";
import { defaultProperties } from "./default";

export const itemTemplateRegistration = registerModel({
    name: 'itemTemplate',
    plural: 'itemTemplates',
    descriptor: RTTI.object({
        ...defaultProperties('item'),
        cost: RTTI.of<Decimal>(),
    })
});
