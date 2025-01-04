import { typeArrayValidator } from "../utils/typeArrayValidator";

export const modelNames = [
    'actor',
    'room',
    'itemTemplate',
    'item'
] as const;

export type ModelName = typeof modelNames[number];

export const isModelName = typeArrayValidator(modelNames);