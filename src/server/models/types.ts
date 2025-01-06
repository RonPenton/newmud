import { ProxyType, StorageType } from "../rtti";
import { actorRegistration } from "./definitions/actor";
import { itemRegistration } from "./definitions/item";
import { itemTemplateRegistration } from "./definitions/itemTemplate";
import { roomRegistration } from "./definitions/room";
import { ModelName } from "./ModelNames";
import { ModelRegistration, modelRegistrations } from "./Models";

export interface ModelRegistrations extends Record<ModelName, ModelRegistration<any, any, any>> {
    room: typeof roomRegistration;
    actor: typeof actorRegistration;
    itemTemplate: typeof itemTemplateRegistration;
    item: typeof itemRegistration;
}

export type ModelDescriptors = {
    [K in ModelName]: ModelRegistrations[K]['descriptor'];
}

export type ModelStorage<T extends ModelName> = StorageType<ModelDescriptors[T]>;

export type ModelProxy<T extends ModelName> = ProxyType<ModelDescriptors[T]>;

export type ModelPlural = ModelRegistrations[ModelName]['plural'];

export type PluralOf<T extends ModelName> = ModelRegistrations[T]['plural'];

export function modelPlural<T extends ModelName>(name: T): ModelPlural {
    return modelRegistrations[name].plural as ModelPlural;
}

export type Regarding = {
    [K in ModelName]?: ModelProxy<K>;
}
