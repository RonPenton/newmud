import Decimal from "decimal.js";
import { CapType } from "./softcap";
import fs from 'fs';
import { ModelName } from "../models/ModelNames";

export interface StatRegistrations { }

export type StatRegistration<N extends string, M extends ModelName> = {
    readonly name: N;
    readonly description: string;
    readonly max?: Decimal;
    readonly min?: Decimal;
    readonly softcapScale?: Decimal;
    readonly capType: CapType;
    readonly models: M[]
    readonly rounding?: (val: Decimal) => Decimal;
}

export type Stats = {
    [K in keyof StatRegistrations]: StatRegistrations[K] extends StatRegistration<K, any> ? StatRegistrations[K] : never;
};

export type StatName = keyof Stats;

export type InferStat<T extends StatRegistration<any, any>> = {
    [K in T['name']]: T;
};

const statRegistrations: Record<string, StatRegistration<any, any>> = {};

export function registerStat<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>
) {
    statRegistrations[registration.name] = registration;
    return registration;
}

export function getStatRegistration(name: string): StatRegistration<any, any> {
    const val = statRegistrations[name];
    if (!val) {
        throw new Error(`Stat '${name}' not found`);
    }
    return val;
}

export async function loadStatDefinitions() {
    const files = fs.readdirSync(__dirname + '/definitions').filter(f => f.endsWith('.ts'));
    for (const file of files) {
        await import('./definitions/' + file);
    }
}
