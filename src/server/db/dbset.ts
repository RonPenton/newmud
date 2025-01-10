import { filterIterable, flatMapIterable, mapIterable } from "tsc-utils";
import { ModelName } from "../models/ModelNames";
import { modelPlural, ModelProxy, ModelStorage } from "../models";
import { UniverseProxies } from "../universe/universe";

export const InternalAdd = Symbol();
export const InternalDelete = Symbol();
export const InternalClear = Symbol();

export class DbSet<T extends ModelName> {
    private _set = new Set<number>();

    constructor(
        private readonly table: T,
        private objType: ModelName,
        private obj: ModelStorage<ModelName>,
        private proxies: UniverseProxies
    ) { }

    private getChecked(id: number) {
        // console.log(`getting ${this.table}[${id}]`);
        // console.log(this.proxies);
        // console.log(this.proxies[this.table]);
        const item = this.proxies[this.table].get(id);
        if (!item) {
            throw new Error(`Item with id ${id} not found in ${modelPlural(this.table)}.`);
        }
        return item;
    }

    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    public [InternalAdd](value: ModelProxy<T> | number): this {
        if (typeof value === 'number') {
            //console.log(`${this} adding ${this.table}[${value}] {number}`);
            this._set.add(value);
        }
        else {
            //console.log(`${this} adding ${this.table}[${value.id}] {Proxy}`);
            this._set.add(value.id);
        }

        //console.log(`${this}`);

        return this;
    }

    public toString(): string {
        return `DBSET for ${this.objType}[${this.obj.id}/"${this.obj.name}"] ${modelPlural(this.table)}:[${Array([...this._set])}]`;
    }

    /**
     * Clears the entire set.
     */
    public [InternalClear](): void {
        this._set.clear();
    }

    /**
     * Removes a specified value from the Set.
     * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
     */
    public [InternalDelete](value: ModelProxy<T> | number): boolean {
        if (typeof value === 'number') {
            //console.log(`${this} deleting ${this.table}[${value}] {number}`);
            return this._set.delete(value);
        }
        //console.log(`${this} deleting ${this.table}[${value.id}] {Proxy}`);
        return this._set.delete(value.id);
    }

    /**
     * Executes a provided function once per each value in the Set object, in insertion order.
     */
    public forEach(callbackfn: (value: ModelProxy<T>, set: DbSet<T>) => void, thisArg?: any): void {
        this._set.forEach(x => callbackfn(this.getChecked(x), this), thisArg);
    }

    /**
     * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
     */
    public has(value: ModelProxy<T> | number): boolean {
        if (typeof value === 'number') {
            return this._set.has(value);
        }
        return this._set.has(value.id);
    }

    /**
     * @returns the number of (unique) elements in Set.
     */
    public get size(): number {
        return this._set.size;
    }

    public filter<S extends ModelProxy<T>>(predicate: (value: ModelProxy<T>, index: number) => value is S) {
        return filterIterable(this.values(), predicate);
    }

    public map<U>(mapper: (value: ModelProxy<T>, index: number) => U) {
        return mapIterable(this.values(), mapper);
    }

    public flatMap<U>(mapper: (value: ModelProxy<T>, index: number) => Iterable<U>) {
        return flatMapIterable(this.values(), mapper);
    }

    public find<S extends ModelProxy<T>>(predicate: (value: ModelProxy<T>, index: number) => value is S) {
        for(const x of this.values()) {
            if(predicate(x, 0)) {
                return x;
            }
        }

        return undefined;
    }

    public values() {
        return mapIterable(this._set.values(), id => this.getChecked(id));
    }

    public ids() {
        return this._set.keys();
    }
}
