import { IPropertyIndex } from './interfaces/IPropertyIndex';
import { INDEX_TYPES } from './enums';
import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';
import { ExactIndex } from './index-implementations/ExactIndex';
import { NumericIndex } from './index-implementations/NumericIndex';
import { IndexCommonOptions } from './Collection';
import { JsonObject } from './types/Json';
import { NullableIndex } from './index-implementations/NullableIndex';
import { ScalarValue } from './types';

export class IndexManager {
    private readonly indexes = new Map<string, IPropertyIndex<ScalarValue, string>>();

    constructor() {}

    /**
     * Add a new index with the specified name and type
     * @param name index name, usually same name as the indexed property
     * @param indexType index type. see INDEX_TYPES.*
     * @param options options for the spécified index type
     */
    createIndex(
        name: string,
        indexType: INDEX_TYPES,
        options: IndexCommonOptions = {
            precision: 0,
            size: 0,
            caseSensitive: false,
            nullable: false,
        }
    ) {
        switch (indexType) {
            case INDEX_TYPES.PARTIAL: {
                const oIndex = new PartialIndex(options.size ?? 0, options.caseSensitive ?? false);
                this.indexes.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.HASH: {
                const nSize = options.size == 16 ? 16 : 32;
                const oIndex = new CrcIndex(nSize, options.caseSensitive ?? false);
                this.indexes.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.BOOLEAN: {
                const oIndex = new ExactIndex<boolean, string>();
                this.indexes.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.NUMERIC: {
                const oIndex = new NumericIndex(options.precision);
                this.indexes.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            default: {
                throw new Error('Unknown index type');
            }
        }
    }

    /**
     * Unindex all properties from document : it will be either updated or removed
     * @param primaryKey
     * @param data
     */
    unindexDocument(primaryKey: string, data: JsonObject) {
        for (const [propKey: string, index] of this.indexes.entries()) {
            // browsing all indexes
            const dataValue = propKey in data ? data[propKey] : undefined
            if (dataValue !== undefined) {
                // the propKey belongs to data, remove its value from index

            }
        }
    }

    indexDocument(primaryKey: string, data: JsonObject) {
        for (const [propKey, propValue] of Object.entries(data)) {
        }
    }
}
