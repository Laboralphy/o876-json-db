import { Collection } from '../src/Collection';
import { IStorage } from '../src/interfaces/IStorage';
import { JsonObject } from '../src/types/Json';
import { describe } from 'node:test';

class TestStorage implements IStorage {
    public data: Map<string, Map<string, JsonObject>> = new Map<string, Map<string, JsonObject>>();

    async createLocation(location: string): Promise<void> {
        this.data.set(location, new Map<string, JsonObject>());
    }

    async getLocation(location: string): Promise<Map<string, JsonObject>> {
        const r = this.data.get(location);
        if (r) {
            return r;
        } else {
            throw new Error(`location ${location} not found`);
        }
    }

    async getList(location: string): Promise<string[]> {
        const l = await this.getLocation(location);
        return Array.from(l.keys());
    }

    async read(location: string, name: string): Promise<JsonObject | undefined> {
        const l = await this.getLocation(location);
        return l.get(name);
    }

    async remove(location: string, name: string): Promise<void> {
        const l = await this.getLocation(location);
        l.delete(name);
    }

    async write(location: string, name: string, data: JsonObject): Promise<void> {
        const l = await this.getLocation(location);
        l.set(name, data);
    }
}

describe('Collection.path', function () {
    it('should initialize path', function () {
        const c = new Collection('my_path');
        expect(c.path).toBe('my_path');
    });
});

describe('Collection.storage', function () {
    it('should throw a error when asking for undefined storage', function () {
        const s = new Collection('my_path');
        expect(() => s.storage).toThrow(
            new Error(
                'Collection storage adapter is not defined. You must add a storage to this instance (DiskStorage | MemoryStorage).'
            )
        );
    });
    it('should accept TestStorage instance', function () {
        const c = new Collection('my_path');
        c.storage = new TestStorage();
        expect(() => c.storage).not.toThrow(
            new Error(
                'Collection storage adapter is not defined. You must add a storage to this instance (DiskStorage | MemoryStorage).'
            )
        );
    });
});

describe('Collection.init', function () {
    it('should call init with no error when setting fresh new storage', async function () {
        const c = new Collection('my_path');
        c.storage = new TestStorage();
        await expect(() => c.init()).resolves.not.toThrow();
    });
    it('should create a new my_path location', async function () {
        const c = new Collection('my_path');
        const s = new TestStorage();
        c.storage = s;
        await c.init();
        expect(s.getLocation('my_path')).toBeDefined();
    });
});
