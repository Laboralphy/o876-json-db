import { JsonObject } from './types/Json';
import { DbIndex, DbIndexOptions, IndexableValues } from './DbIndex';
import { INDEX_TYPES } from './enums';
import { crc16, crc32 } from './hash-tools';

export class Indexer {
    private readonly _data: Map<string, DbIndex> = new Map<string, DbIndex>();

    get data(): Map<string, DbIndex> {
        return this._data;
    }

    get indices(): string[] {
        return Array.from(this._data.keys());
    }

    /**
     * returns true if index exists.
     * @remark an index is names after the property it indexes
     * @param sIndexName {string} index name (property name)
     * @returns {boolean}
     */
    isIndexed(sIndexName: string): boolean {
        return this._data.has(sIndexName);
    }

    /**
     * Throws an error if specified index does not exist
     * @param sIndexName name of index to be checked
     */
    checkIndex(sIndexName: string) {
        if (!this.isIndexed(sIndexName)) {
            throw new Error('ERR_INDEX_NOT_CREATED: ' + sIndexName);
        }
    }

    /**
     * Creates a new Index
     * @param sIndexName name of index to be creted (usually name of the indexed property)
     * @param options index construction options @see DbIndexOptions
     */
    createIndex(sIndexName: string, options: DbIndexOptions) {
        if (!this.isIndexed(sIndexName)) {
            this._data.set(sIndexName, new DbIndex(options));
        } else {
            throw new Error('ERR_INDEX_ALREADY_CREATED: ' + sIndexName);
        }
    }

    /**
     * Deletes a previously created index.
     * Does not throw error if index does not exist
     * @param sIndexName
     */
    dropIndex(sIndexName: string): void {
        this._data.delete(sIndexName);
    }

    /**
     * Returns true is specified value is null or of type number, string or boolean
     * @param value
     * @return boolean
     * @private
     */
    private _isValidValue(value: IndexableValues): boolean {
        const sType = typeof value;
        return value === null || sType == 'number' || sType == 'string' || sType == 'boolean';
    }

    /**
     * Throw an error if value is not of indexable type
     * @param value
     * @private
     */
    private _checkValueValidity(value: IndexableValues) {
        if (!this._isValidValue(value)) {
            throw new Error('ERR_INVALID_INDEXED_VALUE_TYPE');
        }
    }

    /**
     * Computes a hashed value of the specified value
     * @param oIndex
     * @param value
     */
    getHashedEntry(oIndex: DbIndex, value: IndexableValues) {
        if (value === null || typeof value == 'boolean' || typeof value == 'number') {
            return value;
        }

        if (oIndex.caseInsensitive) {
            value = value.toLowerCase();
        }
        switch (oIndex.indexType) {
            case INDEX_TYPES.PART:
                value = value.substring(oIndex.size);
                break;

            case INDEX_TYPES.CRC16:
                value = crc16(value).toString(36);
                break;

            case INDEX_TYPES.CRC32:
                value = crc32(value).toString(36);
                break;
        }
        return value;
    }

    addIndexedValue(sIndexName, value: IndexableValues, id: string): void {
        this.checkIndex(sIndex);
        this._checkValueValidity(value);
        id = id.toString();
        const oIndex = this._data.get(sIndex);
    }
}
