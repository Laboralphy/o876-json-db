/**
 * Those classes will index all values of a property, associating value to primary-key
 */
export interface IPropertyComparableIndex<T, K> {
    /**
     * Return all primary keys that are considered greater than the specified value
     * @param value
     * @return array of primary keys
     */
    getGreaterThan(value: T): K[];

    /**
     * Return all primary keys that are considered lesser than the specified value
     * @param value
     * @return array of primary keys
     */
    getLesserThan(value: T): K[];
}
