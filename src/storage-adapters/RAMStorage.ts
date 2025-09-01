import { IStorage } from '../interfaces/IStorage';
import { JsonObject } from '../types/Json';

type Collection = Map<string, JsonObject>;

export class RAMStorage implements IStorage {
    private _data = new Map<string, Collection>();

    _getCollection(location: string) {
        if (this._data.has(location)) {
            const d = this._data.get(location);
            if (d instanceof Map) {
                return d;
            } else {
                throw new TypeError(`storage location of wrong type`);
            }
        } else {
            // location not found
            return undefined;
        }
    }

    /**
     * Returns an array of identifier of object present in this location
     * @param location location of objects
     */
    async getList(location: string) {
        const c = this._getCollection(location);
        if (c) {
            return Array.from(c.keys());
        } else {
            return [];
        }
    }

    /**
     * Creates a new location
     * @param location
     */
    async createLocation(location: string) {
        this._data.set(location, new Map<string, JsonObject>());
    }

    async read(location: string, name: string) {
        const c = this._getCollection(location);
        if (c) {
            return c.get(name);
        } else {
            return undefined;
        }
    }

    /**
     * Write a bunch of data at the specified location under the specified identifier
     * @param location
     * @param name
     * @param data
     */
    async write(location: string, name: string, data: JsonObject) {
        const c = this._getCollection(location);
        if (c) {
            c.set(name, data);
        } else {
            throw new Error(`collection ${location} not found`);
        }
    }

    /**
     * @param location
     * @param name
     */
    async remove(location: string, name: string) {
        const c = this._getCollection(location);
        if (c) {
            c.delete(name);
        }
    }
}
