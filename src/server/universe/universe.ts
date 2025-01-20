import { keysOf } from "tsc-utils";
import { ModelName, modelNames } from "../models/ModelNames";
import { ModelProxy, ModelStorage } from '../models/types';
import { getProxyObject } from "../proxy/proxy";
import { Storage } from "../models";
import { dbUpsertObject } from "../db/generic";
import { Db } from "../db";
import { OptionalId, SansId } from "../db/types";

export type UniverseStorage = {
    [K in ModelName]: ModelStorage<K>[];
}

export type UniverseProxies = {
    [K in ModelName]: Map<number, ModelProxy<K>>;
}

export type UniverseChangesets = {
    [K in ModelName]: Set<number>;
}

export type MaxIds = {
    [K in ModelName]: number;
}

export class UniverseManager {

    public constructor(private db: Db, private storage: UniverseStorage) {
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

        this.maxIds = modelNames.reduce((acc, table) => {
            let max = 0;
            for(const item of this.storage[table]) {
                max = Math.max(max, item.id);
            }
            acc[table] = max;
            return acc;
        }, {} as MaxIds);
    }

    public proxies: UniverseProxies;
    private changesets: UniverseChangesets;
    private maxIds: MaxIds;

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

    public async writeDirtyObjects(): Promise<void> {
        for (const model of keysOf(this.changesets)) {
            const clone = new Set(this.changesets[model]);
            this.changesets[model].clear();
            for (const id of clone) {
                const proxy = this.proxies[model].get(id);
                if (proxy) {
                    const storage = proxy[Storage];
                    await dbUpsertObject(this.db, model, storage);
                }
            }
        }
    }

    public createRecord<T extends ModelName>(type: T, data: SansId<ModelStorage<T>>): ModelProxy<T> {
        const withId = { ...data, id: ++this.maxIds[type] };
        this.storage[type].push(withId as any);

        const linkers: (() => void)[] = [];
        const proxy = getProxyObject(type, this, withId as any, linkers);
        this.proxies[type].set(proxy.id, proxy as any);


        this.proxies[type].set(proxy.id, proxy);
        return proxy;
    }
}
