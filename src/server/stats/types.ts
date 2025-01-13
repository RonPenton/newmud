import Decimal from "decimal.js";
import { groupBy, keysOf } from "tsc-utils";
import { ModelProxy, ModelRegistrations } from "../models";
import { identity, IsObject, IsStatCollectionStorage, ObjectDescriptor } from "../rtti";
import { ModelName } from "../models/ModelNames";
import { StatsCollected } from "./collection";

export type Tier = number | 'X';

export type StatType = 'value' | `percent${Tier}`;

export type StatApplication = 'base' | 'total';

export type StatStorage = {
    type: StatType;
    value: Decimal;
    scope: ModelName;
    appliesAt: StatApplication;
    explain?: string;
}

export type StatCoalesced = Partial<Record<StatType, Decimal>>;


export function coalesceStats(stats: StatStorage[]) {
    const coalesced: StatCoalesced = {};

    for (const s of stats) {
        if (s.type == 'percentX') {
            const c = s.value.div(100).add(1);
            const val = coalesced[s.type] ?? new Decimal(1);
            coalesced[s.type] = val.mul(c);
        }
        else {
            const val = coalesced[s.type] ?? new Decimal(0);
            coalesced[s.type] = val.add(s.value);
        }
    }

    if (coalesced.percentX) { coalesced.percentX = coalesced.percentX.sub(1).mul(100); }
    return coalesced;
}

export type StatComputation = {
    value: Decimal;
    appliedStats: StatStorage[];
    remainingStats: StatStorage[];
}

type StatPhase = 'base' | 'total' | 'other';

export function computeStatPhased(
    model: ModelName,
    initialValue: Decimal,
    stats: StatStorage[],
): StatsCollected {
    function classifier(stat: StatStorage): StatPhase {
        if (stat.scope !== model) return 'other';
        return stat.appliesAt;
    }

    const grouped = groupBy(stats, classifier);

    let value = initialValue;

    const base = grouped.get('base') ?? [];
    const total = grouped.get('total') ?? [];
    value = computeStat(base, value);
    value = computeStat(total, value);

    return {
        value,
        all: stats,
        applied: [...base, ...total],
        remaining: grouped.get('other') ?? []
    };
}

export function computeStat(
    stats: StatStorage[],
    initialValue = new Decimal(0)
): Decimal {

    const coalesced = coalesceStats(stats);

    let result = initialValue;
    if (coalesced.value) {
        result = result.add(coalesced.value);
    }

    const tiers = keysOf(coalesced)
        .filter(k => k !== 'percentX' && k.startsWith('percent'))
        .map(k => parseInt(k.slice(7)));

    for (const tier of tiers) {
        const p = coalesced[`percent${tier}`]!.div(100).add(1);
        result = result.mul(p);
    }

    if (coalesced.percentX) {
        result = result.mul(coalesced.percentX.div(100).add(1));
    }

    return result;
}

/**
 * Combines all stats without an "explain" property into a single stat.
 * @param stats 
 * @returns 
 */
export function condenseStats(stats: StatStorage[]): StatStorage[] {
    const condensed: StatStorage[] = [];

    const clone = stats.slice();
    while (clone.length > 0) {
        const val = clone.shift()!;
        if (val.explain || val.type == 'percentX') {
            condensed.push(val);
        }
        else {
            const existing = condensed.find(s => s.type == val.type && !s.explain && s.scope == val.scope && s.appliesAt == val.appliesAt);
            if (existing) {
                existing.value = existing.value.add(val.value);
            }
            else {
                condensed.push(val);
            }
        }
    }

    return condensed;
}

type RemoveEmpty<T> = { [K in keyof T as {} extends T[K] ? never : K]: T[K]; }

type RemoveNever<T> = identity<{ [K in keyof T as T[K] extends never ? never : K]: T[K]; }>;

/**
 * Helper type to extract the "Descriptor" property for a model.
 */
type D<T extends ModelName> = ModelRegistrations[T]['descriptor'];

/**
 * Helper type to extract all "stat collection Storage" properties from an object descriptor.
 */
type S<T extends ObjectDescriptor> = RemoveNever<{
    [K in keyof T]: T[K] extends IsStatCollectionStorage ? T[K] : never
}>;

/**
 * Type to extract all models that have a stat collection storage property, along
 * with the properties themselves so that we can look up the property names.
 */
export type StatModels = RemoveEmpty<{
    [K in ModelName]: D<K> extends IsObject ? S<D<K>['object']> : never
}>;


export type RegardingStat<M extends ModelName> = {
    type: M,
    record: ModelProxy<M>,
    collection: keyof StatModels[M]
};

/**
 * A type that allows us to narrow in on a specific model and collection of stats. 
 */
export type RegardingStats = {
    [K in ModelName]: RegardingStat<K>
}[ModelName]
