import { ReducedIndex } from './ReducedIndex';

/**
 * Exact index will index keys using exact field values
 * should not be used for long string with tons of different values
 * suitable for string or number fields that have a few limited number of different values (less than 1000)
 */
export class ExactIndex<T, K> extends ReducedIndex<T, K, T> {
    protected reduceValue(value: T): T {
        return value;
    }
}
