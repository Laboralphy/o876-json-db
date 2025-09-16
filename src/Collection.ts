import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';

import { FsHelper } from 'o876-fs-ts';
import { IStorage } from './interfaces/IStorage';
import { JsonObject } from './types/Json';
import { INDEX_TYPES } from './enums';
import { IPropertyIndex } from './interfaces/IPropertyIndex';
import { ExactIndex } from './index-implementations/ExactIndex';
import { NumericIndex } from './index-implementations/NumericIndex';
import { QueryObject } from './types/QueryObject';
import { ScalarComparator, ScalarValue } from './types';

// Operators
import { equal } from './operators/equal';
import { greaterThan } from './operators/greater-than';
import { greaterThanEqual } from './operators/greater-than-equal';
import { includes } from './operators/includes';
import { isType } from './operators/is-type';
import { lowerThan } from './operators/lower-than';
import { lowerThanEqual } from './operators/lower-than-equal';
import { match } from './operators/match';
import { mod } from './operators/mod';
import { notEqual } from './operators/not-equal';
import { notIncludes } from './operators/not-includes';
import { IndexManager } from './IndexManager';

//
export type IndexCommonOptions = {
    size?: number;
    caseSensitive?: boolean;
    precision?: number;
    nullable?: boolean;
};

export class Collection {
    private _indexManager = new IndexManager();
    private _storage: IStorage | undefined;
    private _keys = new Set<string>();
    private readonly _lastQuery = {
        fullscan: false,
        iterated: 0,
        indexed: 0,
    };

    constructor(private readonly _path: string) {}

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
        await this.storage.createLocation(this._path);
        const aKeys = await this.storage.getList(this._path);
        this._keys = new Set<string>(aKeys);
    }

    /**
     * retrieve a document by the specified key
     * @param key {string} document identifier
     * @returns {Promise<JsonObject|undefined>} returns undefined if document not found
     */
    async get(key: string): Promise<JsonObject | undefined> {
        return this.storage.read(this._path, key);
    }

    /**
     * Iterates through a set of documents and returns the list of document keys matching the specified predicate
     * @param pFunction a predicate, returns true or false
     * @param keys starting set of keys, if not specified, take all collection keys
     * @private
     */
    private async _forEachDocument(
        pFunction: (data: JsonObject, key: string) => boolean,
        keys?: string[] | undefined
    ): Promise<string[]> {
        const bFullScan = keys == undefined;
        const aKeys = bFullScan ? this.keys : keys;
        this._lastQuery.fullscan = this._lastQuery.fullscan || bFullScan;
        this._lastQuery.iterated += aKeys.length;

        const aOkKeys: string[] = [];
        for (const key of aKeys) {
            const oDocument = await this.get(key);
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
    _isKeyValid(key: string): boolean {
        // must not contain special chars '/\?%*:|"<>.,;= '
        // must contain only char in range 32-127
        return !!key.match(/^[^/\\?%*:|"<>.,;= ]*$/) || !!key.match(/^[\u0021-\u007f]*$/);
    }

    async save(key: string, oDocument: JsonObject) {
        await this.storage.write(this._path, key, oDocument);
        this._keys.add(key);
    }
}
