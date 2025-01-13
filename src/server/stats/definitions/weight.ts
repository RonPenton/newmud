import Decimal from "decimal.js";
import { registerStat } from "../Stats";

const registration = registerStat({
    name: 'weight',
    description: 'The weight of an object',
    min: new Decimal(0),
    capType: 'none',
    models: ['item', 'actor'],
    rounding: val => val.floor()
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
