import Decimal from "decimal.js";
import { keysOf } from "tsc-utils";
import { StatRegistration } from "./Stats";
import { caps } from "./softcap";
import { ModelProxy, ModelRegistrations } from "../models";
import { identity, IsObject, IsStatCollectionStorage, ObjectDescriptor } from "../rtti";
import { ModelName } from "../models/ModelNames";

export type StatType = 'base' | 'max' | 'min' | 'softcapScale' | `percentTier${number}` | 'percentCompounding';

export type StatStorage = {
    type: StatType;
    value: Decimal;
    explain?: string;
}

export type StatCoalesced = Partial<Record<StatType, Decimal>>;

export function coalesceStats(stats: StatStorage[], registration: StatRegistration<any>): StatCoalesced {
    const coalesced: StatCoalesced = {
        min: registration.min,
        max: registration.max,
        softcapScale: registration.softcapScale
    };

    for (const s of stats) {
        const val = coalesced[s.type] ?? new Decimal(0);
        if (s.type == 'percentCompounding') {
            const c = s.value.div(100).add(1);
            if (!coalesced['percentCompounding']) {
                coalesced['percentCompounding'] = new Decimal(1).mul(c);
            }
            else {
                coalesced['percentCompounding'] = coalesced['percentCompounding'].mul(c);
            }
        }
        else {
            coalesced[s.type] = val.add(s.value);
        }
    }

    if (coalesced.percentCompounding) {
        coalesced.percentCompounding = coalesced.percentCompounding.sub(1).mul(100);
    }

    return coalesced;
}


export function computeStat(stats: StatStorage[], registration: StatRegistration<any>): Decimal {

    const coalesced = coalesceStats(stats, registration);

    let result = new Decimal(0);
    if (coalesced.base) {
        result = result.add(coalesced.base);
    }

    const tiers = keysOf(coalesced).filter(k => k.startsWith('percentTier')).map(k => parseInt(k.slice(11)));
    for (const tier of tiers) {
        const p = coalesced[`percentTier${tier}`]!.div(100).add(1);
        result = result.mul(p);
    }

    if (coalesced.percentCompounding) {
        result = result.mul(coalesced.percentCompounding.div(100).add(1));
    }

    // apply the max cap.
    result = caps[registration.capType](result, coalesced.max, coalesced.softcapScale);

    // apply the min cap.
    const min = coalesced.min ?? new Decimal(-Infinity);
    if (result.lt(min)) {
        result = min;
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
        if (val.explain || val.type == 'percentCompounding') {
            condensed.push(val);
        }
        else {
            const existing = condensed.find(s => s.type == val.type && !s.explain);
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
type StatModels = RemoveEmpty<{
    [K in ModelName]: D<K> extends IsObject ? S<D<K>['object']> : never
}>;

/**
 * A type that allows us to narrow in on a specific model and collection of stats. 
 */
export type RegardingStats = {
    [K in keyof StatModels]?: {
        record: ModelProxy<K>;
        collection: keyof StatModels[K];
    }
}
