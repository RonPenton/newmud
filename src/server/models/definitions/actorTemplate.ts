import { RTTI } from "../../rtti";
import { getTemplateProperties } from "../../rtti/templates";
import { registerModel } from "../Models";
import { ActorProperties } from "./actor";
import { defaultProperties } from "./default";
import { raceRegistration } from "./race";

export const actorTemplateRegistration = registerModel({
    name: 'actorTemplate',
    plural: 'actorTemplates',
    descriptor: RTTI.object({
        ...defaultProperties('actorTemplate'),
        properties: RTTI.properties<ActorProperties>(),
        items: RTTI.ownedCollection('item'),
        race: RTTI.templatedFrom('race'),
        ...getTemplateProperties(raceRegistration)
    }),
    onChanges: {}
});
