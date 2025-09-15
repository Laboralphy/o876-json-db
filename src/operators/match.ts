import { ScalarComparator, ScalarValue, ComplexValue } from '../types';

export function match(operand: RegExp): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (typeof value == 'string') {
            return !!value.match(operand);
        } else {
            return false;
        }
    };
}
