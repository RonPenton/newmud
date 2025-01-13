import { ModelName } from "../models/ModelNames";
import { registerStat, StatRegistration } from "./Stats";

export type MaxName<S extends string> = `max${Capitalize<S>}`;

export function maxName<S extends string>(s: S): MaxName<S> {
    return `max${s.charAt(0).toUpperCase()}${s.slice(1)}` as MaxName<S>;
}

export function registerStatMax<N extends string, M extends ModelName>(
    registration: StatRegistration<N, M>
): StatRegistration<MaxName<N>, M> {
    return registerStat({
        name: maxName(registration.name),
        description: `The maximum value of ${registration.name}`,
        capType: 'hard',
        models: registration.models,
        rounding: val => val.floor()
    });
}
