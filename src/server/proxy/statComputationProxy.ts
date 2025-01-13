import { StatCollectionComputed } from '../stats/collection';
import DeepProxy from 'proxy-deep';
import { ModelName } from '../models/ModelNames';
import { ModelProxy } from '../models';
import { statCollectors } from '../stats/collectors';
import { getStatMaxRegistration, getStatRegistration, StatName } from '../stats/Stats';
import { computeStatPhased } from '../stats/types';
import Decimal from 'decimal.js';
import { caps } from '../stats/softcap';

export function getStatComputationProxy<M extends ModelName>(
    type: M,
    record: ModelProxy<M>
): StatCollectionComputed<M> {

    const collector = statCollectors[type];
    if (!collector) {
        throw new Error(`No stat collector for type ${type}`);
    }
    const proxy = new DeepProxy<StatCollectionComputed<M>>(record as any, {

        get(_target, key: StatName) {

            const registration = getStatRegistration(key);
            const stats = collector({ type, record, collection: 'baseStats' }, key);

            const initialValue = registration.startingValue ?? new Decimal(0);
            let { value } = computeStatPhased(type, initialValue, [...stats]);

            function getMax() {
                if (registration.max) return registration.max;
                const maxRegistration = getStatMaxRegistration(key);
                if (maxRegistration) {
                    return record.stats[maxRegistration.name as keyof typeof record.stats];
                }
                return null;
            }

            const max = getMax();
            if(max) {
                value = caps[registration.capType](value, max, registration.softcapScale);
            }

            if(registration.min && value.lt(registration.min)) {
                value = registration.min;
            }

            if (registration.rounding) {
                value = registration.rounding(value);
            }

            return value;
        },

        set() {
            throw new Error(`Not supported`);
        }
    });

    return proxy;
}
