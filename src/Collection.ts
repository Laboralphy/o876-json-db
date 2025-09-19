import { IStorage } from './interfaces/IStorage';
import { JsonObject } from './types/Json';
import { INDEX_TYPES } from './enums';

import { IndexManager, IndexCommonOptions } from './IndexManager';
import { FieldValue, QueryObject } from './types/QueryObject';
import { Cursor } from './Cursor';
import { ILoader } from './interfaces/ILoader';

export type IndexCreationOptions = {
    type: INDEX_TYPES;
} & IndexCommonOptions;

export class Collection implements ILoader {
    private _indexManager = new IndexManager();
    private _storage: IStorage | undefined;
    private _keys = new Set<string>();
    private _bInit = false;

    constructor(
        private readonly _path: string,
        private readonly _indexOptions: { [indexName: string]: IndexCreationOptions } = {}
    ) {}

    get path(): string {
        return this._path;
    }

    set storage(value: IStorage) {
        this._storage = value;
    }

    get storage(): IStorage {
        if (!this._storage) {
            throw new Error(
                'Collection storage adapter is not defined. You must add a storage to this instance (DiskStorage | MemoryStorage).'
            );
        }
        return this._storage;
    }
    get name() {
        return this._path.replace(/\\/g, '/').split('/').pop();
    }

    get keys(): string[] {
        return [...this._keys];
    }

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
        pFunction: (data: JsonObject, key: string) => boolean,
        keys?: string[] | undefined
    ): Promise<string[]> {
        const bFullScan = keys == undefined;
        const aKeys = bFullScan ? this.keys : keys;

        const aOkKeys: string[] = [];
        for (const key of aKeys) {
            const oDocument = await this.load(key);
            if (oDocument && pFunction(oDocument, key)) {
                aOkKeys.push(key);
            }
        }
        return aOkKeys;
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
        await this.filter((data: JsonObject, key: string) => {
            this._indexManager.indexDocument(key, data);
            return false;
        });
    }

    /**
     * Write a document in storage
     * @param key document primary key
     * @param oDocument document content
     */
    async save(key: string, oDocument: JsonObject) {
        this._checkKey(key);
        await this.unindexDocument(key);
        await this.storage.write(this._path, key, oDocument);
        this._indexManager.indexDocument(key, oDocument);
        this._keys.add(key);
    }

    /**
     * Read a document from storage and return its content
     * @param key document primary key
     */
    async load(key: string): Promise<JsonObject | undefined> {
        this._checkKey(key);
        return this.storage.read(this._path, key);
    }

    /**
     * Remove a document from the storage
     * @param key document primary key
     */
    async remove(key: string) {
        this._checkKey(key);
        await this.unindexDocument(key);
        await this.storage.remove(this._path, key);
        this._keys.delete(key);
    }

    /**
     * Evaluate an indexed property value.
     * Returns a list of keys pointing to document where the clause sPropName = propValue is true
     */
    evaluateIndexedProperty(sPropName: string, propValue: FieldValue): string[] {
        if (
            typeof propValue === 'number' ||
            typeof propValue === 'string' ||
            typeof propValue === 'boolean' ||
            propValue === null
        ) {
            return this._indexManager.getIndexedKeys(sPropName, propValue) ?? [];
        }
        return [];
    }

    evaluateNonIndexedProperty(sPropName: string, propValue: FieldValue): Promise<string[]> {
        if (
            typeof propValue === 'number' ||
            typeof propValue === 'string' ||
            typeof propValue === 'boolean' ||
            propValue === null
        ) {
            return this.filter((data: JsonObject) => propValue === data[sPropName]);
        }
        return Promise.resolve([]);
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

    async find(oQuery: QueryObject): Promise<Cursor> {
        const indexedClauseMap = new Map<string, FieldValue>();
        const nonIndexedClauseMap = new Map<string, FieldValue>();
        // dispatch query properties between indexed and non-indexed
        for (const [fieldName, fieldValue] of Object.entries(oQuery)) {
            if (this._indexManager.isIndexed(fieldName)) {
                indexedClauseMap.set(fieldName, fieldValue);
            } else {
                nonIndexedClauseMap.set(fieldName, fieldValue);
            }
        }
        // indexed clauses process
        let foundKeys = new Set<string>();
        let bFoundKeyUninitialized = true;
        if (indexedClauseMap.size > 0) {
            for (const [propName, value] of indexedClauseMap.entries()) {
                // propName is a real name of an indexed property
                // value can be a single value or a complex object
                const fk = this.evaluateIndexedProperty(propName, value);
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
        return new Cursor(Array.from(foundKeys), this);
    }
}
