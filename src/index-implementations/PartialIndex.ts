import { ReducedIndex } from './ReducedIndex';
import { normalizeString } from '../string-normalizer';

/**
 * Partial Index is suitable for string values.
 * Only en few first characters are indexed.
 * Suitable index for fields of string with random length and content
 * Usually use 6 chars of size
 */
export class PartialIndex extends ReducedIndex<string, string, string> {
    /**
     * @param _size size of partial chunk (in characters)
     * @param _caseInsensitive if true then index is case-insensitive
     */
    constructor(
        private readonly _size: number,
        private readonly _caseInsensitive: boolean
    ) {
        super();
    }

    protected reduceValue(value: string): string {
        const sSub = this._size > 0 ? value.substring(0, this._size) : value;
        return this._caseInsensitive ? normalizeString(sSub) : sSub;
    }
}
