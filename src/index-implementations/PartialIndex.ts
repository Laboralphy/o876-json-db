import { ReducedIndex } from './ReducedIndex';

/**
 * Partial Index is suitable for string values.
 * Only en few first characters are indexed.
 * Suitable index for fields of string with random length and content
 */
export class PartialIndex extends ReducedIndex<string> {
    constructor(
        private readonly _size: number,
        private readonly _caseInsensitive: boolean
    ) {
        super();
    }

    protected reduceValue(value: string): string {
        const sSub = value.substring(0, this._size);
        return this._caseInsensitive ? sSub.toLocaleLowerCase() : sSub;
    }
}
