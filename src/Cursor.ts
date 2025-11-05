import { JsonObject } from './types/Json';
import { ILoader } from './interfaces/ILoader';

/**
 * With a list of identifier and an instance of ILoader, the cursor class
 * can lazy load document using old methods first, last, next, prev etc...
 */
export class Cursor<T extends JsonObject> {
    private _index: number = 0;
    private _current: JsonObject | undefined = undefined;

    constructor(
        private _keys: string[],
        private readonly _collection: ILoader
    ) {}

    get keys() {
        return this._keys;
    }

    set index(value: number) {
        const l = this._keys.length;
        if (l === 0) {
            return;
        }
        if (this._index !== value) {
            this._current = undefined;
            this._index = Math.min(l, Math.max(-1, value));
        }
    }

    get index(): number {
        return this._index;
    }

    get currentKey(): string | undefined {
        if (this._index < this._keys.length && this._index >= 0) {
            return this._keys[this._index];
        } else {
            return undefined;
        }
    }

    /**
     * get the current record
     */
    async current(): Promise<T | undefined> {
        const sCurrentKey = this.currentKey;
        if (sCurrentKey === undefined) {
            return undefined;
        }
        if (!this._current) {
            this._current = await this._collection.load(sCurrentKey);
        }
        return this._current as T;
    }

    first(): Promise<T | undefined> {
        this.index = 0;
        return this.current();
    }

    last(): Promise<T | undefined> {
        this.index = this.count - 1;
        return this.current();
    }

    next(): Promise<T | undefined> {
        ++this.index;
        return this.current();
    }

    previous(): Promise<T | undefined> {
        --this.index;
        return this.current();
    }

    get count(): number {
        return this._keys.length;
    }

    /**
     * Returns an array with all loaded items
     */
    async fetchAll(nStart: number = 0, nEnd?: number): Promise<T[]> {
        if (nEnd === undefined) {
            nEnd = this.count - nStart;
        }
        const aDocuments = await Promise.all(
            this._keys.slice(nStart, nEnd).map((k) => this._collection.load(k))
        );
        return aDocuments.filter((document) => document !== undefined) as T[];
    }

    merge(oCursor: Cursor<T>) {
        const aKeySet = new Set([...this._keys, ...oCursor.keys]);
        this._keys = [...aKeySet];
    }
}
