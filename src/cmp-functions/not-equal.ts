import { ComplexValue, ScalarComparator, ScalarValue } from '../types';
import { univCompare } from '../univ-compare';

export function notEqual(operand: string): ScalarComparator;
export function notEqual(operand: number): ScalarComparator;
export function notEqual(operand: null): ScalarComparator;
export function notEqual(operand: boolean): ScalarComparator;
export function notEqual(operand: ScalarValue): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value !== null && typeof value === 'object') {
            return false;
        }
        return univCompare(operand, value) != 0;
    };
}
