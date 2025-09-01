import { ScalarComparator, ScalarValue, ComplexValue } from '../types';

/**
 * Returns true if number is inside array
 * @param array
 * @param n
 */
function includesNumber<T>(array: T[], n: number): boolean {
    return array.some(
        (element) =>
            typeof element == 'number' &&
            !Number.isNaN(element) &&
            !Number.isNaN(n) &&
            element === n
    );
}

function includesString<T>(array: T[], s: string): boolean {
    return array.some((element) => element === s);
}

export function includes(operand: string | (ComplexValue | ScalarValue)[]): ScalarComparator {
    const isString = typeof operand === 'string';
    const isArray = Array.isArray(operand);
    if (!isString && !isArray) {
        throw new TypeError('operand should be either string or array');
    }
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value === undefined || (typeof value == 'object' && value !== null)) {
            return false;
        }

        if (isArray) {
            if (value == null || typeof value == 'boolean') {
                return operand.some((element) => element === value);
            }
            if (typeof value == 'number') {
                return includesNumber(operand, value);
            } else {
                return includesString(operand, value);
            }
        }
        return typeof value === 'string' && operand.indexOf(value) != -1;
    };
}
