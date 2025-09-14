import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';

import { FsHelper } from 'o876-fs-ts';
import { IStorage } from './interfaces/IStorage';
import { JsonObject } from './types/Json';
import { INDEX_TYPES } from './enums';
import { IIndex } from './interfaces/IIndex';
import { ExactIndex } from './index-implementations/ExactIndex';
import { NumericIndex } from './index-implementations/NumericIndex';
//
export type IndexCommonOptions = {
    size?: number;
    caseSensitive?: boolean;
    precision?: number;
};

export class Collection {
    private readonly _indexManagers = {
        num: new Map<string, IIndex<number, string>>(),
        str: new Map<string, IIndex<string, string>>(),
        bool: new Map<string, IIndex<boolean, string>>(),
    };
    private _primary: string = 'id';
    private _io: FsHelper | undefined;
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

    createIndex(
        name: string,
        indexType: INDEX_TYPES,
        options: IndexCommonOptions = { precision: 0, size: 0, caseSensitive: false }
    ) {
        switch (indexType) {
            case INDEX_TYPES.PARTIAL: {
                const oIndex = new PartialIndex(options.size ?? 0, options.caseSensitive ?? false);
                this._indexManagers.str.set(name, oIndex);
                return;
            }
            case INDEX_TYPES.HASH: {
                const nSize = options.size == 16 ? 16 : 32;
                const oIndex = new CrcIndex(nSize, options.caseSensitive ?? false);
                this._indexManagers.str.set(name, oIndex);
                return;
            }
            case INDEX_TYPES.BOOLEAN: {
                const oIndex = new ExactIndex<boolean, string>();
                this._indexManagers.bool.set(name, oIndex);
                return;
            }
            case INDEX_TYPES.NUMERIC: {
                const oIndex = new NumericIndex(options.precision);
                this._indexManagers.num.set(name, oIndex);
                return;
            }
            default: {
                throw new Error('Unknown index type');
            }
        }
    }

    dropIndex(name: string) {
        this._indexManagers.str.delete(name);
        this._indexManagers.num.delete(name);
        this._indexManagers.bool.delete(name);
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
}
