import { ComplexValue, ScalarComparator, ScalarValue } from '../types';
import { comparator } from '../comparator';

export function greaterThan(operand: ScalarValue): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value !== null && typeof value === 'object') {
            return false;
        }
        return comparator(value, operand) >= 0;
    };
}
