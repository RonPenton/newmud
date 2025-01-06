import Decimal from "decimal.js";
import { registerStat } from "../Stats";

const registration = registerStat({
    name: 'hitpoints',
    description: 'The amount of damage a character can take before dying',
    min: new Decimal(0),
    capType: 'hard'
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
