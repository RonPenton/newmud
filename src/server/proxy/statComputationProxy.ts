// import { StatCollectionComputed } from '../stats/collection';
// import DeepProxy from 'proxy-deep';
// import { ModelName } from '../models/ModelNames';
// import { ModelProxy } from '../models';
// import { statCollectors } from '../stats/collectors';

// export function getStatComputationProxy<M extends ModelName>(
//     type: M,
//     obj: ModelProxy<M>
// ): StatCollectionComputed<M> {

//     const collector = statCollectors[type];
//     if (!collector) {
//         throw new Error(`No stat collector for type ${type}`);
//     }
//     const proxy = new DeepProxy<StatCollectionComputed>(obj as any, {

//         get(_target, key) {
//             return collector(obj, key as keyof StatCollectionComputed);
//         },

//         set() {
//             throw new Error(`Not supported`);
//         }
//     });

//     return proxy;
// }
