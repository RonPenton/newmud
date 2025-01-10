import Decimal from "decimal.js";
import { registerStat, registerStatComputer, registerStatMax } from "../Stats";

const registration = registerStat({
    name: 'perception',
    description: 'The ability of a character to percieve visual things',
    startingMin: new Decimal(0),
    capType: 'log2',
    models: ['actor'],
    rounding: val => val.floor()
});

const max = registerStatMax(registration);

registerStatComputer(max, {
    actor: _actor => {

        return new Decimal(100);

        // apply a 10% margin over the persons base perception value. 
        // This allows equipment to increase your perception by a total of 10% 
        // before the softcap kicks in. 
        // const base = actor.baseStats.perception;
        // return base.mul(1.1);
    }
});

declare module "../Stats" { interface StatRegistrations extends InferStat<typeof registration> { } }
declare module "../Stats" { interface StatRegistrations extends InferStat<typeof max> { } }
