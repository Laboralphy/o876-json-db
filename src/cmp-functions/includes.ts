import { ScalarComparator, ScalarValue, ComplexValue } from '../types';

function numberIsInside(container: number[], value: number): boolean {
    return container.includes(value);
}

function stringIsInside(container: string[], value: string): boolean {
    return container.includes(value);
}

export function includes(operand: string): ScalarComparator;
export function includes(operand: string[]): ScalarComparator;
export function includes(operand: number[]): ScalarComparator;
export function includes(operand: string | string[] | number[]): ScalarComparator {
    const bString = typeof operand === 'string';
    const bArray = Array.isArray(operand);
    return (value: ComplexValue | ScalarValue | undefined): boolean => {
        if (value === undefined || typeof value === 'object') {
            return false;
        }
        if (bArray) {
            return (operand as Array).includes(value);
        }
        if (bString) {
            return operand.include(value);
        }
        return bString ? operand.includes(value) : operand.includes(value);
    };
}
