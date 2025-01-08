import Decimal from "decimal.js";
import { makeScript } from "../../extensibleLogic/types";

const script = makeScript('actor', {
    collectStats: ({ stat }, b) => {
        if(stat === 'hitpoints') {
            return [...b, { type: 'base', value: new Decimal(10) }];
        }
        return b;
    }
});

export { script };