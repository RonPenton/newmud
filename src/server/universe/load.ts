import { Db } from "../db";
import { pagedLoad } from "../db/load";
import { modelNames } from "../models/ModelNames";
import { time } from "../utils/timeFunction";
import { UniverseStorage } from "./universe";

export async function loadUniverseStorage(db: Db): Promise<UniverseStorage> {
    const storage: UniverseStorage = {} as any;

    await time(async () => {
        console.log(`Starting data load...`);

        for (const table of modelNames) {
            storage[table] = await pagedLoad(db, table) as any;
        }
    }, ms => {
        console.log(`Loaded database in ${ms}ms.`);
    });

    return storage;
}