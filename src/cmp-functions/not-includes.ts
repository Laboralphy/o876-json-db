import { ScalarComparator, ScalarValue, ComplexValue } from '../types';
import { includes } from './includes';

export function notIncludes<T extends string | (ComplexValue | ScalarValue)[] | string[]>(
    operand: T
): ScalarComparator {
    const f = includes(operand);
    return (value) => !f(value);
}
