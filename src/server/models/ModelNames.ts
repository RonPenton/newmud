import { typeArrayValidator } from "../utils/typeArrayValidator";

export const modelNames = [
    'actor',
    'actorTemplate',
    'room',
    'itemTemplate',
    'item',
    'world',
    'region',
    'area',
    'race'
] as const;

export type ModelName = typeof modelNames[number];

export const isModelName = typeArrayValidator(modelNames);