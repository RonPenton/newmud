import Decimal from "decimal.js";
import { makeScript } from "../../extensibleLogic/types";

const script = makeScript('actor', {
    collectStats: ({ stat, regarding: { type } }, b) => {
        if (type == 'actor' && stat === 'maxHitpoints') {
            return [...b, {
                type: 'value',
                value: new Decimal(10),
                scope: 'actor',
                appliesAt: 'base',
            }];
        }
        return b;
    }
});

export { script };