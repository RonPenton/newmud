import Decimal from "decimal.js";
import { registerStat } from "../Stats";

const registration = registerStat({
    name: 'perception',
    description: 'The ability of a character to percieve visual things',
    max: new Decimal(100),
    min: new Decimal(0),
    capType: 'log2',
    models: ['actor'],
    rounding: val => val.floor()
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
