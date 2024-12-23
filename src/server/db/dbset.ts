import { filterIterable, mapIterable } from "tsc-utils";
import { ModelName, pluralName } from "../models/ModelNames";
import { ModelProxy } from "../models";
import { UniverseManager } from "../universe/universe";

export const InternalAdd = Symbol();
export const InternalDelete = Symbol();
export const InternalClear = Symbol();

export class DbSet<T extends ModelName> {
    private _map = new Map<number, ModelProxy<T>>;

    constructor(private readonly table: T, private universe: UniverseManager) { }

    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    public [InternalAdd](value: ModelProxy<T> | number): this {
        if (typeof value === 'number') {
            const item = this.universe.proxies[this.table].get(value);
            if (!item) {
                throw new Error(`Item with id ${value} not found in ${pluralName(this.table)}.`);
            }
            this._map.set(item.id, item);
        }
        else {
            this._map.set(value.id, value);
        }

        return this;
    }

    /**
     * Clears the entire set.
     */
    public [InternalClear](): void {
        this._map.clear();
    }

    /**
     * Removes a specified value from the Set.
     * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
     */
    public [InternalDelete](value: ModelProxy<T> | number): boolean {
        if (typeof value === 'number') {
            return this._map.delete(value);
        }
        return this._map.delete(value.id);
    }

    /**
     * Executes a provided function once per each value in the Set object, in insertion order.
     */
    public forEach(callbackfn: (value: ModelProxy<T>, set: DbSet<T>) => void, thisArg?: any): void {
        this._map.forEach(x => callbackfn(x, this), thisArg);
    }

    /**
     * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
     */
    public has(value: ModelProxy<T> | number): boolean {
        if (typeof value === 'number') {
            return this._map.has(value);
        }
        return this._map.has(value.id);
    }

    /**
     * @returns the number of (unique) elements in Set.
     */
    public get size(): number {
        return this._map.size;
    }

    public filter<S extends ModelProxy<T>>(predicate: (value: ModelProxy<T>, index: number) => value is S) {
        return filterIterable(this._map.values(), predicate);
    }

    public map<U>(mapper: (value: ModelProxy<T>, index: number) => U) {
        return mapIterable(this._map.values(), mapper);
    }

    public values() {
        return this._map.values();
    }

    public ids() {
        return this._map.keys();
    }
}