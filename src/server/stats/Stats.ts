import Decimal from "decimal.js";
import { CapType } from "./softcap";
import fs from 'fs';
import { ModelName } from "../models/ModelNames";
import { ModelProxy } from "../models";

export interface StatRegistrations { }

export type StatRegistration<N extends string, M extends ModelName> = {
    readonly name: N;
    readonly description: string;
    readonly startingValue?: Decimal;
    readonly startingMax?: Decimal;
    readonly startingMin?: Decimal;
    readonly softcapScale?: Decimal;
    readonly capType: CapType;
    readonly models: M[];
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

export function registerStatMax<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>
): StatRegistration<`max${N}`, M> {
    return registerStat({
        name: `max${registration.name}`,
        description: `The maximum value of ${registration.name}`,
        capType: 'hard',
        models: registration.models,
        rounding: val => val.floor()
    });
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

type StatComputerFunction<M extends ModelName> = (record: ModelProxy<M>) => Decimal;
type StatComputer<M extends ModelName> = {
    [K in M]?: StatComputerFunction<K>;
}

export const statComputers: Record<StatName, StatComputer<any>> = {} as any;

export function registerStatComputer<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>,
    computer: StatComputer<M>
) {
    statComputers[registration.name as StatName] = computer;
}
