import { ModelName } from "../models/ModelNames";
import { ModelProxy, Storage } from '../models/types';

export type UniverseStorage = {
    [K in ModelName]: Storage<K>[];
}

export type UniverseProxies = {
    [K in ModelName]: Map<number, ModelProxy<K>>;
}

export type UniverseChangesets = {
    [K in ModelName]: Set<number>;
}

export type UniverseManager = {
    proxies: UniverseProxies;
    changesets: UniverseChangesets;
}
