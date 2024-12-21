import { DbModelName } from "../models/ModelNames";
import { Storage } from '../models/types';

export type UniverseStorage = {
    [K in DbModelName]: Storage<K>
}
