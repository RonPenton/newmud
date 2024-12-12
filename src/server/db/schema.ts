import { Db } from ".";
import { Models } from "../models";
import { dbCreateObjectTable } from "./generic";

export async function createSchema(db: Db) {
    for (const model of Models) {
        await dbCreateObjectTable(db, model);
    }
}
