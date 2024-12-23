import { ModelName } from "../models/ModelNames";
import { Db } from "./index";
import { DbWrapper, OptionalId } from "./types";
import { Storage } from "../models";

export async function dbCreateObjectTable(db: Db, table: ModelName) {
    await db.none(
        `CREATE TABLE IF NOT EXISTS ${table} (
            id serial PRIMARY KEY,
            data jsonb NOT NULL
        );`
    );
}

export async function dbGetObjects<T extends ModelName>(
    db: Db,
    table: T,
    limit: number,
    offset: number
): Promise<Storage<T>[]> {
    const data = await db.manyOrNone<DbWrapper<Storage<T>>>(
        `SELECT * from ${table} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`
    );
    return data.map(x => ({ ...x.data, id: x.id }));
}

export async function dbUpsertObject<T extends ModelName>(
    db: Db,
    table: T,
    object: Storage<T>
): Promise<Storage<T>> {
    const { data, id } = await db.one<DbWrapper<Storage<T>>>(`
        INSERT INTO ${table} (id, data) VALUES($[id], $[object::jsonb])
        ON CONFLICT(id) DO UPDATE SET data=$[object::json]
        RETURNING *;
    `, { id: object.id, object });
    return { ...data, id };
}

export async function dbCreateObject<T extends ModelName>(
    db: Db,
    table: T,
    object: OptionalId<Storage<T>>
): Promise<Storage<T>> {
    if (!object.id) {
        const { id, data } = await db.one<DbWrapper<Storage<T>>>(`
        INSERT INTO ${table} (data) VALUES($[object])
        RETURNING *;
    `, { object });
        return { ...data, id };
    }
    else {
        const wrapper = await db.one<DbWrapper<Storage<T>>>(`
        INSERT INTO ${table} (id, data) VALUES(\${id}, \${object})
        RETURNING *;
    `, { id: object.id, object });
        return { ...wrapper.data, id: wrapper.id };
    }
}

export async function dbUpdateObject<T extends ModelName>(
    db: Db,
    table: T,
    object: Storage<T>
): Promise<Storage<T>> {
    const { id } = object;
    const { data } = await db.one<DbWrapper<Storage<T>>>(`
        UPDATE ${table} SET data=\${object:json} 
        WHERE id=\${id}
        RETURNING *;
    `, { id, object });
    return data;
}

export async function dbDeleteObject(db: Db, table: ModelName, id: number): Promise<void> {
    await db.none(`DELETE FROM ${table} WHERE id=\${id}`, { id });
}
