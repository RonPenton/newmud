import { Db } from ".";
import { dbGetObjects, dbUpdateObject } from "./generic";
import { ModelName } from "../models/ModelNames";
import { ModelStorage } from "../models";

export async function pagedLoad<T extends ModelName>(db: Db, table: T): Promise<ModelStorage<T>[]> {
    const arr: ModelStorage<T>[] = [];

    let page = 0;
    const pageSize = 100;
    while (true) {
        const data = await dbGetObjects(db, table, pageSize, page * pageSize);
        if (data.length == 0) {
            break;
        }
        data.forEach(x => arr.push(x));
        page++;
    }

    return arr;
}
