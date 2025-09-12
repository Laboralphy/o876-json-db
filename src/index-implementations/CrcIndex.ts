import { ReducedIndex } from './ReducedIndex';
import { crc16, crc32 } from '../hash-tools';
import { normalizeString } from '../string-normalizer';

/**
 * Hashed index for random string values
 */
export class CrcIndex extends ReducedIndex<string, string> {
    /**
     *
     * @param _size size of cyclic redundancy check (values : 16 or 32)
     * @param _caseInsensitive if true then index is case-insensitive
     */
    constructor(
        private readonly _size: 16 | 32,
        private readonly _caseInsensitive: boolean
    ) {
        super();
        if (this._size != 16 && this._size != 32) {
            throw new TypeError('First parameter values must be 16 or 32');
        }
    }

    protected reduceValue(value: string) {
        if (this._caseInsensitive) {
            value = normalizeString(value);
        }
        switch (this._size) {
            case 32: {
                return crc32(value).toString(36);
            }
            case 16: {
                return crc16(value).toString(36);
            }
        }
    }
}
