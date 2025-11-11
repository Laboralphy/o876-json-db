import { IStorage } from './interfaces/IStorage';
import { JsonObject } from './types/Json';
import { INDEX_TYPES } from './enums';

import { IndexManager, IndexCommonOptions } from './IndexManager';
import { FieldValue, QueryObject } from './types/QueryObject';
import { Cursor } from './Cursor';
import { ILoader } from './interfaces/ILoader';
import { comparator } from './comparator';
import { greaterThan } from './operators/greater-than';
import { lesserThan } from './operators/lesser-than';
import { applyOnBunchOfDocs } from './operators/includes/apply-bunch-of-docs';
import { equal } from './operators/equal';
import { notEqual } from './operators/not-equal';

export type IndexCreationOptions = {
    type: INDEX_TYPES;
} & IndexCommonOptions;

export type CollectionStat = {
    loads: number;
    indexes: string[];
    nonIndexes: string[];
    microtime: number;
    indexLog: { property: string; loads: number }[];
};

export class Collection<T extends JsonObject> implements ILoader {
    private _indexManager = new IndexManager();
    private _storage: IStorage | undefined;
    private _keys = new Set<string>();
    private _bInit = false;
    private _stats: CollectionStat = {
        loads: 0,
        indexes: [],
        nonIndexes: [],
        microtime: 0,
        indexLog: [],
    };

    /**
     * The constructor requires a path (for file system storage)
     * @param _path collection path (see .path)
     * @param _indexOptions index options
     */
    constructor(
        private readonly _path: string,
        private readonly _indexOptions: { [indexName: string]: IndexCreationOptions } = {}
    ) {}

    get stats(): { loads: number } {
        return this._stats;
    }

    /**
     * Returns the collection path (for collection using file system storage)
     * The collection path is the folder where all documents of the collection are stored.
     */
    get path(): string {
        return this._path;
    }

    /**
     * Define collection storage, use it before .init
     * You must create an instance of a class implementing the interface IStorage
     * @example collection.storage = new MemoryStorage()
     * @example collection.storage = new DiskStorage()
     * @param value
     */
    set storage(value: IStorage) {
        this._storage = value;
    }

    /**
     * Gets the storage instance previously sets with get storage
     */
    get storage(): IStorage {
        if (!this._storage) {
            throw new Error(
                'Collection storage adapter is not defined. You must add a storage to this instance (DiskStorage | MemoryStorage).'
            );
        }
        return this._storage;
    }

    /**
     * Returns the name of the collection (infered by the path)
     */
    get name() {
        return this._path.replace(/\\/g, '/').split('/').pop();
    }

    /**
     * Returns a list of all documents keys of this collection
     */
    get keys(): string[] {
        return [...this._keys];
    }

    /**
     * Returns the index manager instance
     */
    get indexManager(): IndexManager {
        return this._indexManager;
    }

    /**
     * Initialize the collection by performing these actions
     * - Create storage location (for FS storage)
     * - Builds a list of document keys
     * - Build a document index
     */
    async init() {
        if (this._bInit) {
            throw new Error(`collection ${this._path} already initialized.`);
        }
        await this.storage.createLocation(this._path);
        const aKeys = await this.storage.getList(this._path);
        this._keys = new Set<string>(aKeys);
        for (const [indexName, indexOptions] of Object.entries(this._indexOptions)) {
            this.createIndex(indexName, indexOptions.type, indexOptions);
        }
        await this.indexAllDocuments();
        this._bInit = true;
    }

    /**
     * Iterates through a set of documents and returns the list of document keys matching the specified predicate
     * @param pFunction a predicate, returns true or false
     * @param keys starting set of keys, if not specified, take all collection keys
     * @private
     */
    async filter(
        pFunction: (data: JsonObject, key: string, index: number) => boolean,
        keys?: string[] | undefined
    ): Promise<string[]> {
        const bFullScan = keys == undefined;
        const aKeys = bFullScan ? this.keys : keys;

        const aValidKeys = new Set<string>();
        await applyOnBunchOfDocs(aKeys, this, aValidKeys, pFunction);
        return [...aValidKeys];
    }

    /**
     * Return true is the key is valid (not containing characters that will upset the file system)
     * @param key {string|number} document identifier
     * @return {boolean}
     * @private
     */
    private _isKeyValid(key: string): boolean {
        // must not contain special chars '/\?%*:|"<>.,;= '
        // must contain only char in range 32-127
        return !!key.match(/^(\.|-|\w)+$/);
    }

    /**
     * Throws an error if key is not valid
     * @param key
     * @private
     */
    private _checkKey(key: string) {
        if (!this._isKeyValid(key)) {
            throw new Error(
                'Document key contains invalid character(s), valid characters are : a-z A-Z 0-9 underscore, dash, dot'
            );
        }
    }

    /**
     * Creates an index for a given property.
     * Only top level properties of a document may be indexed
     * @param name name of the indexed property
     * @param indexType index type ; see INDEX_TYPES enum
     * @param options index options
     */
    private createIndex(
        name: string,
        indexType: INDEX_TYPES,
        options: IndexCommonOptions = {}
    ): void {
        if (this._bInit) {
            throw new Error(
                `collection ${this._path} already initialized. index should have been declared at construction`
            );
        }
        this._indexManager.createIndex(name, indexType, options);
    }

    /**
     * Removes a document from index manager
     * @param key
     */
    async unindexDocument(key: string) {
        const oPrevDoc = await this.load(key);
        if (oPrevDoc) {
            this._indexManager.unindexDocument(key, oPrevDoc);
        }
    }

    /**
     * indexes all documents
     */
    private async indexAllDocuments(): Promise<void> {
        this._indexManager.clearAll();
        await this.filter((data: JsonObject, key: string, index: number) => {
            this._indexManager.indexDocument(key, data);
            return false;
        });
    }

    /**
     * Write a document in storage
     * @param key document primary key
     * @param oDocument document content
     */
    async save(key: string, oDocument: T) {
        this._checkKey(key);
        await this.unindexDocument(key);
        await this.storage.write(this._path, key, oDocument);
        this._keys.add(key);
        this._indexManager.indexDocument(key, oDocument);
    }

    /**
     * Read a document from storage and return its content
     * @param key document primary key
     */
    async load(key: string): Promise<T | undefined> {
        this._checkKey(key);
        ++this._stats.loads;
        const document = await this.storage.read(this._path, key);
        if (document !== undefined) {
            return document as T;
        } else {
            return undefined;
        }
    }

    /**
     * Remove a document from the storage
     * @param key document primary key
     */
    async delete(key: string) {
        this._checkKey(key);
        await this.unindexDocument(key);
        await this.storage.remove(this._path, key);
        this._keys.delete(key);
    }

    /**
     * Evaluate an operator against all document of the collection
     * @param sPropName
     * @param propValue
     */
    async evaluateOperator(
        sPropName: string,
        propValue: FieldValue
    ): Promise<string[] | undefined> {
        if (propValue instanceof RegExp) {
            // property value is RegExp
            // scans all document and try to match
            return this.filter((data) => {
                if (typeof data[sPropName] == 'string') {
                    const r = data[sPropName].match(propValue);
                    return !!r;
                } else {
                    return false;
                }
            });
        } else if (
            typeof propValue === 'object' &&
            propValue !== null &&
            !Array.isArray(propValue)
        ) {
            // property value is an object but not an array
            // try to evaluate operator
            let bFirst = true;
            let result = new Set<string>();
            for (const [operator, operand] of Object.entries(propValue)) {
                switch (operator) {
                    case '$eq': {
                        if (
                            operand === null ||
                            typeof operand == 'string' ||
                            typeof operand == 'number'
                        ) {
                            const k = new Set<string>(await equal(this, sPropName, operand));
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                    case '$neq': {
                        if (
                            operand === null ||
                            typeof operand == 'string' ||
                            typeof operand === 'number'
                        ) {
                            const k = new Set<string>(await notEqual(this, sPropName, operand));
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                    case '$gt': {
                        if (typeof operand == 'string' || typeof operand === 'number') {
                            const k = new Set<string>(
                                await greaterThan<T>(this, sPropName, operand)
                            );
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                    case '$lt': {
                        if (typeof operand == 'string' || typeof operand === 'number') {
                            const k = new Set<string>(await lesserThan(this, sPropName, operand));
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                    case '$gte': {
                        if (typeof operand == 'string' || typeof operand === 'number') {
                            const k = new Set<string>(
                                await greaterThan(this, sPropName, operand, true)
                            );
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                    case '$lte': {
                        if (typeof operand == 'string' || typeof operand === 'number') {
                            const k = new Set<string>(
                                await lesserThan(this, sPropName, operand, true)
                            );
                            result = bFirst ? k : this.intersection(k, result);
                        } else {
                            throw new TypeError(
                                `Unexpected operand type for operator '${operator}' expected string | number, got ${typeof operand}`
                            );
                        }
                        break;
                    }
                }
                bFirst = false;
            }
            return [...result];
        }
        return undefined;
    }

    /**
     * Evaluate an indexed property value.
     * Returns a list of keys pointing to document where the clause sPropName = propValue is true
     */
    async evaluateIndexedProperty(sPropName: string, propValue: FieldValue): Promise<string[]> {
        if (
            typeof propValue === 'number' ||
            typeof propValue === 'string' ||
            typeof propValue === 'boolean' ||
            propValue === null
        ) {
            const aKeys = this._indexManager.getIndexedKeys(sPropName, propValue) ?? [];
            const options = this._indexManager.getIndexOptions(sPropName);
            const bExactIndex = this._indexManager.isExactIndex(sPropName);
            if (bExactIndex) {
                return aKeys;
            }
            return this.filter((data) => {
                if (
                    typeof data[sPropName] === 'number' ||
                    typeof data[sPropName] === 'string' ||
                    typeof data[sPropName] === 'boolean' ||
                    data[sPropName] === null
                ) {
                    return comparator(data[sPropName], propValue, options.caseInsensitive) === 0;
                } else {
                    return false;
                }
            }, aKeys);
        }
        const r = await this.evaluateOperator(sPropName, propValue);
        return r ?? [];
    }

    async evaluateNonIndexedProperty(sPropName: string, propValue: FieldValue): Promise<string[]> {
        if (
            typeof propValue === 'number' ||
            typeof propValue === 'string' ||
            typeof propValue === 'boolean' ||
            propValue === null
        ) {
            return this.filter((data: JsonObject) => propValue === data[sPropName]);
        }
        const r = await this.evaluateOperator(sPropName, propValue);
        return r ?? [];
    }

    /**
     * Removes from targetSet all items that are not in filterSet, and return result
     * Does not mutate targetSet
     * @param targetSet
     * @param filterSet
     */
    intersection(targetSet: Set<string>, filterSet: Set<string>) {
        return new Set([...targetSet].filter((element) => filterSet.has(element)));
    }

    /**
     * Find documents using a query languege similar of mongo
     * @param oQuery query langage :
     * @example .find({ name: { $gte: 'M' }}
     */
    async find(oQuery: QueryObject): Promise<Cursor<T>> {
        const s = this._stats;
        s.loads = 0;
        s.indexes = [];
        s.nonIndexes = [];
        s.indexLog = [];
        const hrTime = process.hrtime();
        const indexedClauseMap = new Map<string, FieldValue>();
        const nonIndexedClauseMap = new Map<string, FieldValue>();
        // dispatch query properties between indexed and non-indexed
        for (const [fieldName, fieldValue] of Object.entries(oQuery)) {
            if (this._indexManager.isIndexed(fieldName)) {
                indexedClauseMap.set(fieldName, fieldValue);
                s.indexes.push(fieldName);
            } else {
                nonIndexedClauseMap.set(fieldName, fieldValue);
                s.nonIndexes.push(fieldName);
            }
        }
        // indexed clauses process
        let foundKeys = new Set<string>();
        let bFoundKeyUninitialized = true;
        const sil = s.indexLog;
        let sumIndexLoads = 0;
        if (indexedClauseMap.size > 0) {
            for (const [propName, value] of indexedClauseMap.entries()) {
                // propName is a real name of an indexed property
                // value can be a single value or a complex object
                const fk = await this.evaluateIndexedProperty(propName, value);
                if (bFoundKeyUninitialized) {
                    bFoundKeyUninitialized = false;
                    fk.forEach((key) => {
                        foundKeys.add(key);
                    });
                } else {
                    foundKeys = this.intersection(foundKeys, new Set(fk));
                }
                const currentLoads = s.loads - sumIndexLoads;
                sil.push({ property: propName, loads: currentLoads });
                sumIndexLoads += currentLoads;
            }
        }
        if (nonIndexedClauseMap.size > 0) {
            for (const [propName, value] of nonIndexedClauseMap.entries()) {
                const fk = await this.evaluateNonIndexedProperty(propName, value);
                if (bFoundKeyUninitialized) {
                    bFoundKeyUninitialized = false;
                    fk.forEach((key) => {
                        foundKeys.add(key);
                    });
                } else {
                    foundKeys = this.intersection(foundKeys, new Set(fk));
                }
            }
        }
        const cursor = new Cursor<T>(Array.from(foundKeys), this);
        const [nSec, nNanoSec] = process.hrtime(hrTime);
        this._stats.microtime = nSec * 1000000 + nNanoSec / 1000;
        return cursor;
    }
}
