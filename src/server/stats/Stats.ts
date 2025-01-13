import Decimal from "decimal.js";
import { CapType } from "./softcap";
import fs from 'fs';
import { ModelName } from "../models/ModelNames";
import { ModelProxy } from "../models";
import { MaxName, maxName } from "./limits";

export interface StatRegistrations { }

export type StatRegistration<N extends string, M extends ModelName> = {
    readonly name: N;
    readonly description: string;
    readonly startingValue?: Decimal;
    readonly max?: Decimal;
    readonly min?: Decimal;
    readonly softcapScale?: Decimal;
    readonly capType: CapType;
    readonly models: M[];
    readonly rounding?: (val: Decimal) => Decimal;
}

export type StatRegistrationAugmented<N extends string, M extends ModelName> = StatRegistration<N, M> & {
    computer?: StatComputer<M>;
}

export type StatAugmentation<N extends string, M extends ModelName> = Omit<StatRegistrationAugmented<N, M>, keyof StatRegistration<N, M>>;

export type Stats = {
    [K in keyof StatRegistrations]: StatRegistrations[K] extends StatRegistration<K, any>
    ? StatRegistrations[K]
    : never;
};

export type StatName = keyof Stats;

export type InferStat<T extends StatRegistration<any, any>> = {
    [K in T['name']]: T;
};

const statRegistrations: Record<string, StatRegistrationAugmented<any, any>> = {};

export function registerStat<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>
) {
    statRegistrations[registration.name] = registration;
    return registration;
}

export function getStatRegistration<S extends StatName>(name: S): StatRegistrationAugmented<S, any> {
    const val = statRegistrations[name];
    if (!val) {
        throw new Error(`Stat '${name}' not found`);
    }
    return val;
}

export function getStatMaxRegistration<S extends StatName>(name: S): StatRegistrationAugmented<MaxName<S>, any> | null {
    const val = statRegistrations[maxName(name as any)];
    if (!val) return null;
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

// export const statComputers: Record<StatName, StatComputer<any>> = {} as any;

export function registerStatAugmentation<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>,
    augmentation: StatAugmentation<N, M>
) {
    statRegistrations[registration.name as StatName] = {
        ...registration,
        ...augmentation
    };
}
