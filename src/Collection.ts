import { PartialIndex } from './index-implementations/PartialIndex';
import { CrcIndex } from './index-implementations/CrcIndex';
import { NumericIndex } from './index-implementations/NumericIndex';

import { FsHelper } from 'o876-fs-ts';
import { IStorage } from './interfaces/IStorage';
import { JsonObject } from './types/Json';
import { INDEX_TYPES } from './enums';
import { IIndex } from './interfaces/IIndex';
//
export type IndexCommonOptions = {
    size?: number;
    caseSensitive?: boolean;
};

export class Collection {
    private readonly _indexManagers = {
        partial: new Map<string, PartialIndex>(),
        hash: new Map<string, CrcIndex>(),
        numeric: new Map<string, NumericIndex>(),
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

    linkIndex(name: string, oIndex: IIndex<number, string>);
    linkIndex(name: string, oIndex: IIndex<string, string>);
    linkIndex(name: string, oIndex: IIndex<boolean, string>);
    linkIndex(name: string, oIndex: IIndex<any, string>) {
        if (oIndex instanceof )
    }

    createIndex(
        sName: string,
        indexType: INDEX_TYPES,
        options?: IndexCommonOptions = { size: 0, caseSensitive: false }
    ) {}
}
