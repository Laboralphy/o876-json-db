import { ReducedIndex } from './ReducedIndex';
import { IPropertyComparableIndex } from '../interfaces/IPropertyComparableIndex';
import { comparator } from '../comparator';
import { ScalarValue } from '../types';

/**
 * Exact index will index keys using exact field values
 * should not be used for long string with tons of different values
 * suitable for string or number fields that have a few limited number of different values (less than 1000)
 */
export class ExactIndex<T extends ScalarValue, K>
    extends ReducedIndex<T, K, T>
    implements IPropertyComparableIndex<T, K>
{
    protected reduceValue(value: T): T {
        return value;
    }

    getGreaterThan(value: T): K[] {
        const accPrimKeys: K[] = [];
        const reducedValue = this.reduceValue(value);
        for (const [fieldReducedValue, primaryKeys] of this.propertyIndex.entries()) {
            if (comparator(fieldReducedValue, reducedValue) > 0) {
                accPrimKeys.push(...primaryKeys);
            }
        }
        return accPrimKeys;
    }

    getLesserThan(value: T): K[] {
        const accPrimKeys: K[] = [];
        const reducedValue = this.reduceValue(value);
        for (const [fieldReducedValue, primaryKeys] of this.propertyIndex.entries()) {
            if (comparator(fieldReducedValue, reducedValue) < 0) {
                accPrimKeys.push(...primaryKeys);
            }
        }
        return accPrimKeys;
    }
}
