import { IPropertyIndex } from './interfaces/IPropertyIndex';
import { INDEX_TYPES } from './enums';
import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';
import { ExactIndex } from './index-implementations/ExactIndex';
import { NumericIndex } from './index-implementations/NumericIndex';
import { JsonObject, JsonValue } from './types/Json';
import { TruthyIndex } from './index-implementations/TruthyIndex';
import { ScalarValue } from './types';
import { comparator } from './comparator';

export type IndexCommonOptions = {
    size?: number;
    caseInsensitive?: boolean;
    precision?: number;
    nullable?: boolean;
};

class RegistryEntry {
    constructor(
        private readonly _name: string,
        private readonly _indexType: INDEX_TYPES,
        private readonly _options: IndexCommonOptions,
        private readonly _exact: boolean
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

    get exact() {
        return this._exact;
    }
}

export class IndexManager {
    private readonly str = new Map<string, IPropertyIndex<string, string, string>>();
    private readonly num = new Map<string, IPropertyIndex<number, string, number>>();
    private readonly bool = new Map<string, IPropertyIndex<boolean, string, boolean>>();
    private readonly val = new Map<string, IPropertyIndex<JsonValue, string, boolean>>();
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
            caseInsensitive: false,
            nullable: false,
        }
    ) {
        let bIsExact = false;
        switch (indexType) {
            case INDEX_TYPES.PARTIAL: {
                const oIndex = new PartialIndex(
                    options.size ?? 0,
                    options.caseInsensitive ?? false,
                    options.nullable ?? false
                );
                bIsExact = oIndex.isExact;
                this.str.set(name, oIndex);
                break;
            }
            case INDEX_TYPES.HASH: {
                const nSize = options.size == 16 ? 16 : 32;
                const oIndex = new CrcIndex(
                    nSize,
                    options.caseInsensitive ?? false,
                    options.nullable ?? false
                );
                bIsExact = oIndex.isExact;
                this.str.set(name, oIndex);
                break;
            }
            case INDEX_TYPES.BOOLEAN: {
                const oIndex = new ExactIndex<boolean, string>(options.nullable ?? false);
                bIsExact = oIndex.isExact;
                this.bool.set(name, oIndex);
                break;
            }
            case INDEX_TYPES.NUMERIC: {
                const oIndex = new NumericIndex(options.precision, options.nullable ?? false);
                bIsExact = oIndex.isExact;
                this.num.set(name, oIndex);
                break;
            }
            case INDEX_TYPES.TRUTHY: {
                const oIndex = new TruthyIndex();
                bIsExact = oIndex.isExact;
                this.val.set(name, oIndex);
                break;
            }
            default: {
                throw new Error('Unknown index type');
            }
        }
        this.registry.set(name, new RegistryEntry(name, indexType, options, bIsExact));
    }

    getNumIndexOrDie(name: string): IPropertyIndex<number, string, number> {
        const oIndex = this.num.get(name);
        if (oIndex) {
            return oIndex;
        } else {
            throw new ReferenceError(`Unknown numeric index ${name}`);
        }
    }

    getStrIndexOrDie(name: string): IPropertyIndex<string, string, string> {
        const oIndex = this.str.get(name);
        if (oIndex) {
            return oIndex;
        } else {
            throw new ReferenceError(`Unknown string index ${name}`);
        }
    }

    getBoolIndexOrDie(name: string): IPropertyIndex<boolean, string, boolean> {
        const oIndex = this.bool.get(name);
        if (oIndex) {
            return oIndex;
        } else {
            throw new ReferenceError(`Unknown boolean index ${name}`);
        }
    }

    getValIndexOrDie(name: string): IPropertyIndex<JsonValue, string, boolean> {
        const oIndex = this.val.get(name);
        if (oIndex) {
            return oIndex;
        } else {
            throw new ReferenceError(`Unknown any-value index ${name}`);
        }
    }

    getIndexOptions(name: string): IndexCommonOptions {
        const r = this.registry.get(name);
        if (r) {
            return r.options;
        } else {
            throw new ReferenceError(`unknown index ${name}`);
        }
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
        if (this.val.has(indexName)) {
            const indexMap = this.val.get(indexName);
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
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    if (dataValue === undefined) {
                        // We don't want undefined value
                        throw new TypeError(
                            `undefined values are unsupported for numeric index : property ${indexName}`
                        );
                    }
                    const oIndex = this.getNumIndexOrDie(indexName);
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
                    if (dataValue === undefined || dataValue === null) {
                        // We don't want null or undefined value
                        // We will support this in a future version
                        throw new TypeError(
                            `null or undefined values are unsupported for numeric boolean : property ${indexName}`
                        );
                    }
                    const oIndex = this.getBoolIndexOrDie(indexName);
                    if (typeof dataValue === 'boolean') {
                        oIndex.remove(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type boolean : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.TRUTHY: {
                    const oIndex = this.getValIndexOrDie(indexName);
                    oIndex.remove(dataValue, primaryKey);
                    break;
                }

                case INDEX_TYPES.PARTIAL:
                case INDEX_TYPES.HASH: {
                    if (dataValue === undefined) {
                        // We don't want undefined value
                        throw new TypeError(
                            `undefined values are unsupported for string index : property ${indexName}`
                        );
                    }
                    const oIndex = this.getStrIndexOrDie(indexName);
                    if (typeof dataValue === 'string') {
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
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    if (dataValue === undefined) {
                        // We don't want undefined value
                        throw new TypeError(
                            `null or undefined values are unsupported for numeric index : property ${indexName}`
                        );
                    }
                    const oIndex = this.getNumIndexOrDie(indexName);
                    if (dataValue === null || typeof dataValue === 'number') {
                        oIndex.add(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type number : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.BOOLEAN: {
                    if (dataValue === undefined || dataValue === null) {
                        // We don't want null or undefined value for a boolean
                        throw new TypeError(
                            `null or undefined values are unsupported for boolean index : property ${indexName}`
                        );
                    }
                    const oIndex = this.getBoolIndexOrDie(indexName);
                    if (typeof dataValue === 'boolean') {
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
                    if (dataValue === undefined || dataValue === null) {
                        // We don't want null or undefined value
                        // We will support this in a future version
                        throw new TypeError(
                            `null or undefined values are unsupported for string index : property ${indexName}`
                        );
                    }
                    const oIndex = this.getStrIndexOrDie(indexName);
                    if (typeof dataValue === 'string') {
                        oIndex.add(dataValue, primaryKey);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof dataValue} given`
                        );
                    }
                    break;
                }

                case INDEX_TYPES.TRUTHY: {
                    const oIndex = this.getValIndexOrDie(indexName);
                    oIndex.add(dataValue, primaryKey);
                    break;
                }
            }
        }
    }

    getIndexedKeys(indexName: string, value: JsonValue): string[] | undefined {
        const registryEntry = this.registry.get(indexName);
        if (registryEntry) {
            switch (registryEntry.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    const oIndex = this.getNumIndexOrDie(indexName);
                    if (value === null || typeof value === 'number') {
                        return oIndex.get(value);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type number : ${typeof value} given`
                        );
                    }
                }

                case INDEX_TYPES.BOOLEAN: {
                    const oIndex = this.getBoolIndexOrDie(indexName);
                    if (typeof value === 'boolean') {
                        return oIndex.get(value);
                    } else {
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type boolean : ${typeof value} given`
                        );
                    }
                }

                case INDEX_TYPES.TRUTHY: {
                    const oIndex = this.getValIndexOrDie(indexName);
                    return oIndex.get(value);
                }

                case INDEX_TYPES.PARTIAL:
                case INDEX_TYPES.HASH: {
                    const oIndex = this.getStrIndexOrDie(indexName);
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
     * Fetches an index registry and extract all value using a comparator function
     */
    callRegistryComparator(
        indexName: string,
        value: JsonValue,
        comparatorFunction: <T extends ScalarValue>(vcomp: T, map: Map<T, Set<string>>) => string[]
    ) {
        // fetching the definition of the specified index (by indexName)
        const indexDef = this.registry.get(indexName);
        if (indexDef) {
            // indexDef found : continue
            switch (indexDef.indexType) {
                case INDEX_TYPES.NUMERIC: {
                    // numeric index: choose suitable index registry : number
                    const oIndex = this.getNumIndexOrDie(indexName);
                    // index number registry found : check value type : must be number
                    if (typeof value === 'number') {
                        // let the comparator function have the last word
                        return comparatorFunction(oIndex.reduceValue(value), oIndex.getIndexMap());
                    } else {
                        // wrong type of value : throw error
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type number : ${typeof value} given`
                        );
                    }
                }

                case INDEX_TYPES.PARTIAL: {
                    // partial index is basically a string index : choose suitable index registry : string
                    const oIndex = this.getStrIndexOrDie(indexName);
                    // index number registry found : check value type : must be string
                    if (typeof value === 'string') {
                        // let the comparator function have the last word
                        return comparatorFunction(oIndex.reduceValue(value), oIndex.getIndexMap());
                    } else {
                        // wrong type of value : throw error
                        throw new TypeError(
                            `${indexName} requires that indexed value is of type string : ${typeof value} given`
                        );
                    }
                }

                default: {
                    throw new Error(`this index type is invalid for a comparison`);
                }
            }
        }
        return undefined; // index registry was not found
    }

    dichotomicalSearch<T extends ScalarValue>(aArray: T[], value: T): number {
        let iLeft = 0;
        let iRight = aArray.length - 1;

        while (iLeft <= iRight) {
            const iMid = Math.floor((iLeft + iRight) / 2);

            if (aArray[iMid] === value) {
                return iMid; // Valeur trouvée, retourne l'index
            } else if (comparator(aArray[iMid], value) < 0) {
                iLeft = iMid + 1;
            } else {
                iRight = iMid - 1;
            }
        }
        return iLeft;
    }

    getGreaterIndexKeys(indexName: string, value: JsonValue): string[] | undefined {
        const f = <T extends ScalarValue>(vcomp: T, map: Map<T, Set<string>>) => {
            const m = new Set<string>();
            if (vcomp === null) {
                return [];
            }
            let bAdd = false;
            for (const [v, k] of map.entries()) {
                if (!bAdd && comparator(v, vcomp) > 0) {
                    bAdd = true;
                }
                if (bAdd) {
                    for (const x of k) {
                        m.add(x);
                    }
                }
            }
            return [...m];
        };
        return this.callRegistryComparator(indexName, value, f);
    }

    getLesserIndexKeys(indexName: string, value: JsonValue): string[] | undefined {
        const f = <T extends ScalarValue>(vcomp: T, map: Map<T, Set<string>>) => {
            const m = new Set<string>();
            if (vcomp === null) {
                return [];
            }
            for (const [v, k] of map.entries()) {
                if (comparator(v, vcomp) < 0) {
                    for (const x of k) {
                        m.add(x);
                    }
                } else {
                    break;
                }
            }
            return [...m];
        };
        return this.callRegistryComparator(indexName, value, f);
    }

    /**
     * Returns true if property is indexed
     * @param prop property name
     */
    isIndexed(prop: string): boolean {
        return this.registry.has(prop);
    }

    /**
     * Returns true if index is exact (and does not need to invoke collection.load)
     * @param prop {string}
     */
    isExactIndex(prop: string): boolean {
        const r = this.registry.get(prop);
        if (r) {
            return r.exact;
        } else {
            throw new ReferenceError(`Index "${prop}" not found`);
        }
    }
}
