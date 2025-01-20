import { ProxyType, StorageType } from "../rtti";
import { actorRegistration } from "./definitions/actor";
import { actorTemplateRegistration } from "./definitions/actorTemplate";
import { areaRegistration } from "./definitions/area";
import { itemRegistration } from "./definitions/item";
import { itemTemplateRegistration } from "./definitions/itemTemplate";
import { raceRegistration } from "./definitions/race";
import { regionRegistration } from "./definitions/region";
import { roomRegistration } from "./definitions/room";
import { worldRegistration } from "./definitions/world";
import { ModelName } from "./ModelNames";
import { ModelRegistration, modelRegistrations } from "./Models";

export interface ModelRegistrations extends Record<ModelName, ModelRegistration<any, any, any>> {
    room: typeof roomRegistration;
    actor: typeof actorRegistration;
    actorTemplate: typeof actorTemplateRegistration;
    itemTemplate: typeof itemTemplateRegistration;
    item: typeof itemRegistration;
    world: typeof worldRegistration;
    region: typeof regionRegistration;
    area: typeof areaRegistration;
    race: typeof raceRegistration;
}

export type ModelDescriptors = {
    [K in ModelName]: ModelRegistrations[K]['descriptor'];
}

export type ModelStorage<T extends ModelName> = StorageType<ModelDescriptors[T]>;

export const Storage = Symbol();

export type ModelProxy<T extends ModelName> = ProxyType<ModelDescriptors[T]> & {
    [Storage]: ModelStorage<T>;
};

export type ModelPlural = ModelRegistrations[ModelName]['plural'];

export type PluralOf<T extends ModelName> = ModelRegistrations[T]['plural'];

export function modelPlural<T extends ModelName>(name: T): ModelPlural {
    return modelRegistrations[name].plural as ModelPlural;
}
