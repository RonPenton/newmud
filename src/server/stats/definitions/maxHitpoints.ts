import Decimal from "decimal.js";
import { registerStat } from "../Stats";

const registration = registerStat({
    name: 'maxHitpoints',
    description: 'The amount of damage a character can take before dying',
    startingMin: new Decimal(0),
    capType: 'hard',
    models: ['actor'],
    rounding: val => val.floor()
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
