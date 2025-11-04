import { ScalarValue } from '../types';

/**
 * Those classes will index all values of a property, associating value to primary-key
 */
export interface IPropertyIndex<T, K, X extends ScalarValue> {
    /**
     * Adds an entry in index.
     * The given value is associated with the given primary key
     * @param value Value to be indexed
     * @param primaryKey Primary key
     */
    add(value: T | null, primaryKey: K): void;

    /**
     * Returns all primary keys associate with a given value.
     * @param value Searched value
     * @returns Array of primary keys (empty if none matching)
     */
    get(value: T | null): K[];

    /**
     * Dissociates a primary key from a value
     * @param value Value
     * @param primaryKey Primary key to remove
     */
    remove(value: T | null, primaryKey: K): void;

    /**
     * Checks if this value has been indexed.
     * @param value Value to check
     */
    has(value: T | null): boolean;

    /**
     * Removes all indexed values
     */
    clear(): void;

    /**
     * Reduce a value before storing it as an index.
     * @param value
     */
    reduceValue(value: T): X;

    /**
     * Returns an ordered list of reduced index if possible
     * (some index are not ordered by design like Hash index)
     * @return an ordered list of index
     */
    getIndexMap(): Map<X, Set<K>>;

    /**
     * Returns true when this index
     */
    get isExact(): boolean;
}
