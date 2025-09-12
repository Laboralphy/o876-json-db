import { ReducedIndex } from './ReducedIndex';

/**
 * Partial Index is suitable for string values.
 * Only en few first characters are indexed.
 * Suitable index for fields of string with random length and content
 * Usually use 6 chars of size
 */
export class NumericIndex extends ReducedIndex<number, string> {
    /**
     * @param _precision size of numeric range
     */
    constructor(private readonly _precision: number = 1) {
        super();
    }

    protected reduceValue(value: number): number {
        return Math.floor(value / this._precision);
    }
}
