import Decimal from "decimal.js";
import { RTTI } from "../../rtti";
import { registerModel } from "../Models";

export const itemTemplateRegistration = registerModel({
    name: 'itemTemplate',
    plural: 'itemTemplates',
    descriptor: RTTI.object({
        id: RTTI.id(),
        name: RTTI.of<string>(),
        cost: RTTI.of<Decimal>(),
    })
});
