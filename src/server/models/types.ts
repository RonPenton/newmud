import { ProxyType, StorageType } from "../rtti";
import { actorRegistration } from "./definitions/actor";
import { itemRegistration } from "./definitions/item";
import { itemTemplateRegistration } from "./definitions/itemTemplate";
import { roomRegistration } from "./definitions/room";
import { ModelName } from "./ModelNames";
import { ModelRegistration } from "./Models";


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


type A = ModelStorage<'actor'>;

type B = ModelProxy<'actor'>;

type C = ModelProxy<'room'>;

type D = ModelStorage<'room'>;


function borp<M extends ModelName>(model: ModelStorage<M>, p: ModelProxy<M>) {
    return p.name;
    model.name;

    return model.id;
}

let b: C;

b.actors.map(a => a.name);

b.logic.canEnter({

}, {

})

