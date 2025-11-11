import { ReducedIndex } from './ReducedIndex';

/**
 * Partial Index is suitable for string values.
 * Only en few first characters are indexed.
 * Suitable index for fields of string with random length and content
 * Usually use 6 chars of size
 */
export class NumericIndex extends ReducedIndex<number, string, number> {
    /**
     * @param _precision size of numeric range
     * @param _nullable if true, null values are accepted
     */
    constructor(
        private readonly _precision: number = 1,
        _nullable: boolean = false
    ) {
        super(_nullable);
    }

    reduceValue(value: number): number {
        const p = this._precision;
        return p === 1 ? value : Math.floor(value / p);
    }

    get isExact() {
        return this._precision === 1;
    }
}
