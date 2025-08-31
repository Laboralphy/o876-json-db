import { ScalarValue } from './types';

/**
 * Compares two values of type number, string, boolean, or null
 * @param a first value
 * @param b second value
 * @return 0 if a = b, lower than 0 if a smaller than b, greater than 0 if a greater than b
 */
export function univCompare(a: ScalarValue | undefined, b: ScalarValue | undefined): number {
    if (a === b) {
        // same value of same type
        return 0;
    }
    if (a === null && b === undefined) {
        return 1;
    }
    if (a === undefined && b === null) {
        return -1;
    }
    // here : a and b are not of same value and/or same type
    if (a === null || a === undefined) {
        // b should not be null/undefined
        return -1;
    }
    if (b === null || b === undefined) {
        // a should not be null/undefined
        return 1;
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
        // a and b are obsiously different values
        // if a is true than b is false
        // if b is true then a is false
        return a ? 1 : -1; // false < true
    }
    if (typeof a === 'boolean') {
        return -1;
    }
    if (typeof b === 'boolean') {
        return 1;
    }
    // from here, a and b should be either number or strings
    if (typeof a === 'number' && typeof b === 'number') {
        // both a and b are number : just make substraction
        return a - b;
    }
    if (typeof a === 'number') {
        return -1;
    }
    if (typeof b === 'number') {
        return 1;
    }
    // a and b are obsiously string
    // returns a localeCompare
    return a.localeCompare(b);
}
