// const move = '{action} {exit}';
// const give = '{action} {#quantity?} {item} to {target}';

// /**
//  * Identity type coerces typescript into evaluating a type expression, so that it 
//  * is more readable and easier to debug.
//  */
// type identity<T> = T;

// /**
//  * Flatten type takes types joined by & and flattens them into a single object type, 
//  * so that it is more readable and easier to debug.
//  */
// type flatten<T> = identity<{
//     [k in keyof T]: T[k];
// }>;

// type ParseRaw<T extends string> = flatten<FragmentRec<T>>;

// type FragmentRec<T extends string> = T extends `${string}{${infer U}} ${infer R}`
//     ? InferOptional<U> & FragmentRec<R>
//     : Fragment<T>;

// type Fragment<T extends string> = T extends `${string}{${infer U}}` ? InferOptional<U> : T;

// type InferOptional<T extends string> = T extends `${infer U}?`
//     ? {
//         [K in U as Name<K>]?: InferType<U>
//     } : {
//         [K in T as Name<K>]: InferType<T>
//     };

// type InferType<T extends string> = T extends `#${string}` ? number : string;

// type Name<T> = T extends `#${infer U}` ? Name<U> : T extends `${infer U}?` ? Name<U> : T;

// type A = ParseRaw<typeof give>; // 'action' | 'exit'