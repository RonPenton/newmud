import { UniverseProxies, UniverseStorage } from "./universe";

export function proxifyUniverse(universe: UniverseStorage): UniverseProxies {

    for (const table of modelNames) {
        manager.changesets[table] = new Set();
    }

    return manager;   

}