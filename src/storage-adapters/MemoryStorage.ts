import { IStorage } from '../interfaces/IStorage';
import { JsonObject } from '../types/Json';

type StorageLocation = Map<string, JsonObject>;

export class MemoryStorage implements IStorage {
    private _data = new Map<string, StorageLocation>();

    private _getStorageLocation(location: string) {
        if (this._data.has(location)) {
            const d = this._data.get(location);
            if (d instanceof Map) {
                return d;
            } else {
                throw new TypeError(`storage location ${location} of wrong type (should be a Map)`);
            }
        } else {
            // location not found
            throw new TypeError(`storage location ${location} not found`);
        }
    }

    /**
     * Returns an array of identifier of object present in this location
     * @param location location of objects
     */
    async getList(location: string) {
        const c = this._getStorageLocation(location);
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
        const c = this._getStorageLocation(location);
        return c.get(name);
    }

    /**
     * Write a bunch of data at the specified location under the specified identifier
     * @param location
     * @param name
     * @param data
     */
    async write(location: string, name: string, data: JsonObject) {
        const c = this._getStorageLocation(location);
        c.set(name, data);
    }

    /**
     * @param location
     * @param name
     */
    async remove(location: string, name: string) {
        const c = this._getStorageLocation(location);
        c.delete(name);
    }
}
