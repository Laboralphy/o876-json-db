import { ScalarComparator, ScalarValue, ComplexValue } from '../types';
import { univCompare } from '../univ-compare';

export function equal(operand: string): ScalarComparator;
export function equal(operand: number): ScalarComparator;
export function equal(operand: boolean): ScalarComparator;
export function equal(operand: null): ScalarComparator;
export function equal(operand: ScalarValue): ScalarComparator {
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value !== null && typeof value === 'object') {
            return false;
        }
        return univCompare(operand, value) == 0;
    };
}
