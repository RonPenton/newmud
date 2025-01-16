export type Registration<N extends string> = {
    readonly name: N;
    readonly description: string;
}

export type InferRegistration<T extends Registration<any>> = {
    [K in T['name']]: T;
};

export type InferRegistrationBatch<T extends Record<string, Registration<any>>> = {
    [K in keyof T as T[K]['name']]: T[K];
};
