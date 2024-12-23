import { Db } from ".";
import { dbGetObjects } from "./generic";
import { ModelName } from "../models/ModelNames";
import { Storage } from "../models";

export async function pagedLoad<T extends ModelName>(db: Db, table: T): Promise<Storage<T>[]> {
    const arr: Storage<T>[] = [];

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

// export async function saveDbObject<T extends DbModelName>(db: Db, table: T, obj: Storage<T>) {
//     const storage = cloneDeep(obj); // clone object so we don't overwrite anything in use.
//     serializeDecimals(storage);
//     await dbUpdateObject(db, table, storage);
// }
