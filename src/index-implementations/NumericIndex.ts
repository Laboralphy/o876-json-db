import { ReducedIndex } from './ReducedIndex';
import { IPropertyComparableIndex } from '../interfaces/IPropertyComparableIndex';

/**
 * Partial Index is suitable for string values.
 * Only en few first characters are indexed.
 * Suitable index for fields of string with random length and content
 * Usually use 6 chars of size
 */
export class NumericIndex
    extends ReducedIndex<number, string, number>
    implements IPropertyComparableIndex<number, string>
{
    /**
     * @param _precision size of numeric range
     */
    constructor(private readonly _precision: number = 1) {
        super();
    }

    protected reduceValue(value: number): number {
        return Math.floor(value / this._precision);
    }

    getGreaterThan(value: number): string[] {
        const accPrimKeys: string[] = [];
        const reducedValue = this.reduceValue(value);
        for (const [fieldReducedValue, primaryKeys] of this.propertyIndex.entries()) {
            if (fieldReducedValue > reducedValue) {
                accPrimKeys.push(...primaryKeys);
            }
        }
        return accPrimKeys;
    }

    getLesserThan(value: number): string[] {
        const accPrimKeys: string[] = [];
        const reducedValue = this.reduceValue(value);
        for (const [fieldReducedValue, primaryKeys] of this.propertyIndex.entries()) {
            if (fieldReducedValue < reducedValue) {
                accPrimKeys.push(...primaryKeys);
            }
        }
        return accPrimKeys;
    }
}
