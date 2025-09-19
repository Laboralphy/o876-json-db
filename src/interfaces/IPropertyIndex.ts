/**
 * Those classes will index all values of a property, associating value to primary-key
 */
export interface IPropertyIndex<T, K> {
    /**
     * Adds an entry in index.
     * The given value is associated with the given primary key
     * @param value Value to be indexed
     * @param primaryKey Primary key
     */
    add(value: T, primaryKey: K): void;

    /**
     * Returns all primary keys associate with a given value.
     * @param value Searched value
     * @returns Array of primary keys (empty if none matching)
     */
    get(value: T): K[];

    /**
     * Dissociates a primary key from a value
     * @param value Value
     * @param primaryKey Primary key to remove
     */
    remove(value: T, primaryKey: K): void;

    /**
     * Checks if this value has been indexed.
     * @param value Value to check
     */
    has(value: T): boolean;

    /**
     * Removes all indexed values
     */
    clear(): void;
}
