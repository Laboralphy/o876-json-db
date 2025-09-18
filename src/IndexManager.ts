import { IPropertyIndex } from './interfaces/IPropertyIndex';
import { INDEX_TYPES } from './enums';
import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';
import { ExactIndex } from './index-implementations/ExactIndex';
import { NumericIndex } from './index-implementations/NumericIndex';
import { JsonObject } from './types/Json';
import { NullableIndex } from './index-implementations/NullableIndex';
import { ScalarValue } from './types';

export type IndexCommonOptions = {
    size?: number;
    caseSensitive?: boolean;
    precision?: number;
    nullable?: boolean;
};

class RegistryEntry {
    constructor(
        private readonly _name: string,
        private readonly _indexType: INDEX_TYPES,
        private readonly _options: IndexCommonOptions
    ) {}

    get name() {
        return this._name;
    }

    get indexType() {
        return this._indexType;
    }

    get options() {
        return this._options;
    }
}

export class IndexManager {
    private readonly str = new Map<string, IPropertyIndex<string | null, string>>();
    private readonly num = new Map<string, IPropertyIndex<number | null, string>>();
    private readonly bool = new Map<string, IPropertyIndex<boolean | null, string>>();
    private readonly registry = new Map<string, RegistryEntry>();

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
                this.str.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.HASH: {
                const nSize = options.size == 16 ? 16 : 32;
                const oIndex = new CrcIndex(nSize, options.caseSensitive ?? false);
                this.str.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.BOOLEAN: {
                const oIndex = new ExactIndex<boolean, string>();
                this.bool.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            case INDEX_TYPES.NUMERIC: {
                const oIndex = new NumericIndex(options.precision);
                this.num.set(name, options.nullable ? new NullableIndex(oIndex) : oIndex);
                break;
            }
            default: {
                throw new Error('Unknown index type');
            }
        }
        this.registry.set(name, new RegistryEntry(name, indexType, options));
    }

    clearIndex(indexName: string) {
        if (this.str.has(indexName)) {
            const indexMap = this.str.get(indexName);
            if (indexMap) {
                indexMap.clear();
            }
        }
        if (this.num.has(indexName)) {
            const indexMap = this.num.get(indexName);
            if (indexMap) {
                indexMap.clear();
            }
        }
        if (this.bool.has(indexName)) {
            const indexMap = this.bool.get(indexName);
            if (indexMap) {
                indexMap.clear();
            }
        }
    }

    clearAll() {
        for (const indexName of this.registry.keys()) {
            this.clearIndex(indexName);
        }
    }

    /**
     * Unindex all properties from document
     * Before modifiying a document properties, the document must be unindexed,
     * else, index will point toward invalid keys.
     * Once unindexed, modified, the document may be indexed again with new property values
     * @param primaryKey
     * @param data
     */
    unindexDocument(primaryKey: string, data: JsonObject) {
        for (const [indexName, registryEntry] of this.registry.entries()) {
            const dataValue = data[indexName];
            if (!registryEntry.options.nullable && dataValue === null) {
                throw new TypeError(
                    `${indexName} does not support null values : must be declared as nullable`
                );
            }
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    const oIndex = this.num.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "num" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'number') {
                        oIndex.remove(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.BOOLEAN: {
                    const oIndex = this.bool.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "bool" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'boolean') {
                        oIndex.remove(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type boolean : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.PARTIAL:
                case INDEX_TYPES.HASH: {
                    const oIndex = this.str.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "str" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'string') {
                        oIndex.remove(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof dataValue} given`
                        );
                    }
                    break;
                }
            }
        }
    }

    /**
     * indexes a document.
     * @param primaryKey
     * @param data
     */
    indexDocument(primaryKey: string, data: JsonObject) {
        for (const [indexName, registryEntry] of this.registry.entries()) {
            const dataValue = data[indexName];
            if (!registryEntry.options.nullable && dataValue === null) {
                throw new TypeError(
                    `${indexName} does not support null values : must be declared as nullable`
                );
            }
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    const oIndex = this.num.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "num" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'number') {
                        oIndex.add(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.BOOLEAN: {
                    const oIndex = this.bool.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "bool" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'boolean') {
                        oIndex.add(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type boolean : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.PARTIAL:
                case INDEX_TYPES.HASH: {
                    const oIndex = this.str.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "str" map (should be)`);
                    }
                    if (dataValue === null || typeof dataValue === 'string') {
                        oIndex.add(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof dataValue} given`
                        );
                    }
                    break;
                }
            }
        }
    }

    getIndexedKeys(indexName: string, value: ScalarValue): string[] | undefined {
        const registryEntry = this.registry.get(indexName);
        if (registryEntry) {
            if (!registryEntry.options.nullable && value === null) {
                return [];
            }
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    const oIndex = this.num.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "num" map (should be)`);
                    }
                    if (value === null || typeof value === 'number') {
                        return oIndex.get(value);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type number : ${typeof value} given`
                        );
                    }
                }

                case INDEX_TYPES.BOOLEAN: {
                    const oIndex = this.bool.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "bool" map (should be)`);
                    }
                    if (value === null || typeof value === 'boolean') {
                        return oIndex.get(value);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type boolean : ${typeof value} given`
                        );
                    }
                }

                case INDEX_TYPES.PARTIAL:
                case INDEX_TYPES.HASH: {
                    const oIndex = this.str.get(indexName);
                    if (!oIndex) {
                        throw new Error(`${indexName} index not found in "str" map (should be)`);
                    }
                    if (value === null || typeof value === 'string') {
                        return oIndex.get(value);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof value} given`
                        );
                    }
                }

                default: {
                    throw new Error(`this index type is invalid`);
                }
            }
        } else {
            return undefined;
        }
    }

    /**
     * Returns true if property is indexed
     * @param prop property name
     */
    isIndexed(prop: string): boolean {
        return this.registry.has(prop);
    }
}
