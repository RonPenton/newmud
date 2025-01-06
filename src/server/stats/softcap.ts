import Decimal from "decimal.js";

export type CapType = 'none' | 'hard' | 'log2';

export const caps = {
    log2: (value, max, scale) => {
        if(!max || !scale) {
            // effectively no cap if no max is defined.
            return value;
        }

        if (value.lte(max)) {
            return value;
        }

        const factor = max.mul(scale);
        // max + (log2(value / max) * factor);
        return max.add(Decimal.log2(value.div(max)).mul(factor));
    },
    hard: (value, max) => {
        if(!max) { return value; }

        if (value.lte(max)) {
            return value;
        }
        return max;
    },
    none: (value) => value
} satisfies Record<CapType, (value: Decimal, max: Decimal | undefined, scale: Decimal | undefined) => Decimal>;
