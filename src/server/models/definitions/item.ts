// import { RTTI } from "../../rtti";
// import { registerModelName } from "../ModelNames";
// import { registerModel } from "../Models";
// import { registration as itemTemplateRegistration } from "./itemTemplate";

// const name = registerModelName({
//     name: 'item',
//     plural: 'items',
// });

// const registration = registerModel(
//     name,
//     {
//         ...itemTemplateRegistration.descriptor, // inherit base properties from itemTemplate

//         room: RTTI.ownedBy('room').nullable(),
//         actor: RTTI.ownedBy('actor').nullable(),
//         itemTemplate: RTTI.templatedFrom('itemTemplate'),
//     }
// );

// declare module "../ModelNames" { interface ModelNames extends InferModelName<typeof name> { } }
// declare module "../Models" { interface Models extends InferModel<typeof registration> { } }
