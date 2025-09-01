import { ScalarComparator, ScalarValue, ComplexValue } from '../types';

export function mod([divisor, remainder]: [number, number]): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (typeof value === 'number') {
            return value % divisor == remainder;
        } else {
            return false;
        }
    };
}
