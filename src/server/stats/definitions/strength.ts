import Decimal from "decimal.js";
import { registerStat } from "../Stats";

const registration = registerStat({
    name: 'strength',
    description: 'Your physical strength',
    min: new Decimal(0),
    startingValue: new Decimal(0),
    capType: 'hard',
    models: ['actor'],
    rounding: val => val.floor()
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
