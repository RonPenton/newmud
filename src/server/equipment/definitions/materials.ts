import { InferRegistration } from "../../utils/infer";
import { augmentRegistration, registerMaterialType } from "../materials";

const registration = registerMaterialType({
    name: 'metal',
    description: 'metal'
});

const steel = registerMaterialType({
    name: 'steel',
    description: 'steel',
})

// const reg2 = registerMaterialType({
//     name: 'steel',
//     description: 'steel',
// })//.augment({ parentMaterial: 'metal'});



declare module "../materials" { interface Materials extends InferRegistration<typeof registration> { } }
declare module "../materials" { interface Materials extends InferRegistration<typeof steel> { } }
