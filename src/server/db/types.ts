/**
 * Objects are stored in JSONB columns named 'data', since we don't use the database
 * in real time, we just load it in memory (we're not MMO-scaling here) and write out
 * upon changes. DB Wrapper represents that. 
 */
export type DbWrapper<T> = {
    id: number,
    data: T
};

/**
 * A type that removes the ID property from another type.
 */
export type SansId<T> = Omit<T, 'id'>;

/**
 * A type that allows the ID to be optional.
 */
export type OptionalId<T> = Omit<T, 'id'> & { id?: number };
