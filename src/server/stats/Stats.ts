import Decimal from "decimal.js";
import { CapType } from "./softcap";
import fs from 'fs';

export interface StatRegistrations {

}

export type StatRegistration<N extends string> = {
    name: N;
    description: string;
    max?: Decimal;
    min?: Decimal;
    softcapScale?: Decimal;
    capType: CapType;
    rounding?: (val: Decimal) => Decimal;
}

export type Stats = {
    [K in keyof StatRegistrations as StatRegistrations[K] extends StatRegistration<any> ? K : never]: StatRegistration<K>;
}

export type StatName = keyof Stats;

export type InferStat<T extends StatRegistration<any>> = {
    [K in T['name']]: T;
};

const statRegistrations: Record<string, StatRegistration<any>> = {};

export function registerStat<N extends string>(
    registration: StatRegistration<N>
) {
    statRegistrations[registration.name] = registration;
    return registration;
}

export function getStatRegistration(name: string): StatRegistration<any> {
    const val = statRegistrations[name];
    if(!val) {
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
