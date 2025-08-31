import { ComplexValue, ScalarComparator, ScalarValue } from '../types';
import { univCompare } from '../univ-compare';

export function lowerThan(operand: string): ScalarComparator;
export function lowerThan(operand: number): ScalarComparator;
export function lowerThan(operand: boolean): ScalarComparator;
export function lowerThan(operand: null): ScalarComparator;
export function lowerThan(operand: ScalarValue): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value !== null && typeof value === 'object') {
            return false;
        }
        return univCompare(value, operand) <= 0;
    };
}
