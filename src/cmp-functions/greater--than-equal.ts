import { ComplexValue, ScalarComparator, ScalarValue } from '../types';
import { univCompare } from '../univ-compare';

export function greaterThan(operand: string): ScalarComparator;
export function greaterThan(operand: number): ScalarComparator;
export function greaterThan(operand: boolean): ScalarComparator;
export function greaterThan(operand: null): ScalarComparator;
export function greaterThan(operand: ScalarValue): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value !== null && typeof value === 'object') {
            return false;
        }
        return univCompare(value, operand) >= 0;
    };
}
