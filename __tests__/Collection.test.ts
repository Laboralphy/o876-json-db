import { Collection } from '../src/Collection';
import { IStorage } from '../src/interfaces/IStorage';
import { JsonObject } from '../src/types/Json';
import { INDEX_TYPES } from '../src/enums';

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

describe('Collection find', function () {
    it('should return { id: 1, name: "jack" } when retrieve non indexed value', async function () {
        const cni = new Collection('my_path');
        cni.storage = new TestStorage();
        await cni.init();
        for (let i = 0; i < 100; ++i) {
            await cni.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        await cni.save('789123', {
            name: 'jack',
        });
        for (let i = 0; i < 33; ++i) {
            await cni.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        const x = await cni.find({ name: 'jack' });
        expect(x.count).toBe(1);
    });
    it('should return { id: 1, name: "jack" } when retrieve indexed value', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        for (let i = 0; i < 100; ++i) {
            await c.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        await c.save('789123', {
            name: 'jack',
        });
        for (let i = 0; i < 33; ++i) {
            await c.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        const x = await c.find({ name: 'jack' });
        expect(x.count).toBe(1);
    });
    it('should return { id: 1x5, name: "jack" }, (where x 0-9) when retrieve indexed value', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        for (let i = 0; i < 100; ++i) {
            await c.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        await c.save('105', {
            id: 105,
            name: 'jack',
        });
        await c.save('115', {
            id: 115,
            name: 'jack',
        });
        await c.save('125', {
            id: 125,
            name: 'jack',
        });
        await c.save('135', {
            id: 135,
            name: 'jack',
        });
        await c.save('145', {
            id: 145,
            name: 'jack',
        });
        await c.save('155', {
            id: 155,
            name: 'jack',
        });
        await c.save('165', {
            id: 165,
            name: 'jack',
        });
        await c.save('175', {
            id: 175,
            name: 'jack',
        });
        await c.save('185', {
            id: 185,
            name: 'jack',
        });
        await c.save('195', {
            id: 195,
            name: 'jack',
        });
        for (let i = 0; i < 33; ++i) {
            await c.save(Math.floor(Math.random() * 1000000).toString(), {
                name: Math.floor(Math.random() * 1000000).toString(36),
            });
        }
        const x = await c.find({ name: 'jack' });
        expect(x.count).toBe(10);
        await expect(x.fetchAll()).resolves.toEqual([
            {
                id: 105,
                name: 'jack',
            },
            {
                id: 115,
                name: 'jack',
            },
            {
                id: 125,
                name: 'jack',
            },
            {
                id: 135,
                name: 'jack',
            },
            {
                id: 145,
                name: 'jack',
            },
            {
                id: 155,
                name: 'jack',
            },
            {
                id: 165,
                name: 'jack',
            },
            {
                id: 175,
                name: 'jack',
            },
            {
                id: 185,
                name: 'jack',
            },
            {
                id: 195,
                name: 'jack',
            },
        ]);
    });
    it('should return all instance of jack, Jack, JACK, JaCk...', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'jack' });
        await c.save('1010', { id: 1010, name: 'Jack' });
        await c.save('1020', { id: 1020, name: 'JaCk' });
        await c.save('1030', { id: 1030, name: 'JACK' });
        await c.save('1040', { id: 1040, name: 'j4ck' });
        const x = await c.find({ name: 'jack' });
        expect(x.count).toBe(4);
    });
    it('should return only instance of jack', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: false,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'jack' });
        await c.save('1010', { id: 1010, name: 'Jack' });
        await c.save('1020', { id: 1020, name: 'JaCk' });
        await c.save('1030', { id: 1030, name: 'JACK' });
        await c.save('1040', { id: 1040, name: 'j4ck' });
        const x = await c.find({ name: 'jack' });
        expect(x.count).toBe(1);
    });
    it('should return { id: 1010, name: Jack, age: 42 } when using several condition', async () => {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
            age: {
                type: INDEX_TYPES.NUMERIC,
                precision: 1,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'jack', age: 50 });
        await c.save('1010', { id: 1010, name: 'Jack', age: 42 });
        await c.save('1020', { id: 1020, name: 'JaCk', age: 52 });
        await c.save('1030', { id: 1030, name: 'JACK', age: 33 });
        await c.save('1040', { id: 1040, name: 'j4ck', age: 42 });
        const x = await c.find({ name: 'jack', age: 42 });
        expect(x.count).toBe(1);
        await expect(x.first()).resolves.toEqual({ id: 1010, name: 'Jack', age: 42 });
    });
});
