import { ModelName, modelNames } from "../models/ModelNames";
import { ModelProxy, Storage } from '../models/types';
import { getProxyObject } from "../proxy/proxy";

export type UniverseStorage = {
    [K in ModelName]: Storage<K>[];
}

export type UniverseProxies = {
    [K in ModelName]: Map<number, ModelProxy<K>>;
}

export type UniverseChangesets = {
    [K in ModelName]: Set<number>;
}

export class UniverseManager {

    public constructor(private storage: UniverseStorage) {
        this.changesets = modelNames.reduce((acc, table) => {
            acc[table] = new Set();
            return acc;
        }, {} as UniverseChangesets);
        this.proxies = modelNames.reduce((acc, table) => {
            acc[table] = new Map();
            return acc;
        }, {} as UniverseProxies);

        const linkers: (() => void)[] = [];
        modelNames.forEach(table => {
            this.storage[table].forEach(item => {
                const proxy = getProxyObject(table, this, item, linkers);
                this.proxies[table].set(proxy.id, proxy as any);
            });
        });
        linkers.forEach(linker => linker());
    }

    public proxies: UniverseProxies;
    private changesets: UniverseChangesets;

    public setDirty<T extends ModelName>(type: T, id: number | ModelProxy<T>) {
        if (typeof id === 'number') {
            this.changesets[type].add(id);
        } else {
            this.changesets[type].add(id.id);
        }
    }

    public getDirtyObjects(): UniverseChangesets {
        return this.changesets;
    }

    public getRecord<T extends ModelName>(type: T, id: number): ModelProxy<T> | undefined {
        return this.proxies[type].get(id);
    }
}
