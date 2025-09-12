export interface IIndex<T, K> {
    /**
     * Adds an entry in index.
     * @param value Value to be indexed
     * @param primaryKey Primary key
     */
    add(value: T, primaryKey: K): void;

    /**
     * Get all primary keys associate with value.
     * @param value Searched value
     * @returns Array of primary keys (empty if none matching)
     */
    get(value: T): K[];

    /**
     * Deletes an entre from index.
     * @param value Value to be deleted
     * @param primaryKey Primary key to remove (optional : if not provided, all entries for this value)
     */
    remove(value: T, primaryKey?: K): void;

    /**
     * Checks if this value has been indexed.
     * @param value Value to check
     */
    has(value: T): boolean;
}
