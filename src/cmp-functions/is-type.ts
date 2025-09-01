import { ScalarComparator, ScalarValue, ComplexValue } from '../types';

export function isType(operand: string): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        return typeof value == operand;
    };
}
