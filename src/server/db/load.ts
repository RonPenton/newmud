import { Db } from ".";
import { deserializeDecimals, serializeDecimals } from "../utils/serializeDecimals";
import { dbGetObjects, dbUpdateObject } from "./generic";
import { Model, ModelType } from "../models";
import cloneDeep from 'clone-deep';

export async function pagedLoad<T extends Model>(db: Db, table: T): Promise<ModelType<T>[]> {
    const arr: ModelType<T>[] = [];

    let page = 0;
    const pageSize = 50;
    while (true) {
        const data = await dbGetObjects(db, table, pageSize, page * pageSize);
        if (data.length == 0) {
            break;
        }
        data.forEach(x => deserializeDecimals(x));
        data.forEach(x => arr.push(x));
        page++;
    }

    return arr;
}

export async function saveDbObject<T extends Model>(db: Db, table: T, obj: ModelType<T>) {
    const storage = cloneDeep(obj); // clone object so we don't overwrite anything in use.
    serializeDecimals(storage);
    await dbUpdateObject(db, table, storage);
}
