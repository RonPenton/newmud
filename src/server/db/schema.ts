import { Db } from ".";
import { modelNames } from "../models/ModelNames";
import { dbCreateObjectTable } from "./generic";

export async function createSchema(db: Db) {
    for (const model of modelNames) {
        await dbCreateObjectTable(db, model);
    }
}
