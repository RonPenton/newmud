import { ModelName } from "../../models";

export interface Stuffs {
    room_canEnter: boolean;
    room_canExit: number;
    blop: string;
}

type ExtendsModel<M extends ModelName, T extends string> = T extends `${M}_${infer U}` ? U : never;

export type TStuffs<T extends ModelName> = {
    [K in keyof Stuffs as ExtendsModel<T, K>]: Stuffs[K];
}

export type ATStuffs = {
    [K in ModelName]: TStuffs<K>;
}

type T = ATStuffs;

let a: T  = {};

