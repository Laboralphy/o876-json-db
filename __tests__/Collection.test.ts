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

    it('should find [jack, 42] when having partialindex(2) and numeric(10)', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.PARTIAL,
                caseInsensitive: true,
                size: 2,
            },
            age: {
                type: INDEX_TYPES.NUMERIC,
                precision: 10,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'jack', age: 50 });
        await c.save('1010', { id: 1010, name: 'Jack', age: 42 });
        await c.save('1015', { id: 1015, name: 'Jack', age: 43 });
        await c.save('1020', { id: 1020, name: 'Jeff', age: 52 });
        await c.save('1030', { id: 1030, name: 'Alice', age: 33 });
        await c.save('1040', { id: 1040, name: 'bob', age: 42 });
        const x = await c.find({ name: 'jack', age: 42 });
        expect(x.count).toBe(1);
        await expect(x.first()).resolves.toEqual({ id: 1010, name: 'Jack', age: 42 });
    });

    it('should find object', async function () {
        const c = new Collection('my_path', {
            ban: {
                type: INDEX_TYPES.TRUTHY,
                nullable: true,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'alice', ban: null });
        await c.save('1010', { id: 1010, name: 'bob', ban: { date: 20090812 } });
        await c.save('1015', { id: 1015, name: 'charlie', ban: null });
        await c.save('1020', { id: 1020, name: 'debora', ban: null });
        await c.save('1030', { id: 1030, name: 'eliza', ban: { date: 20201015 } });
        await c.save('1040', { id: 1040, name: 'felix', ban: null });
        const x = await c.find({ ban: { $empty: false } });
        expect(x.count).toBe(2);
        await expect(x.fetchAll()).resolves.toEqual([
            { id: 1010, name: 'bob', ban: { date: 20090812 } },
            { id: 1030, name: 'eliza', ban: { date: 20201015 } },
        ]);
    });
    it('should return 1015 & 1030 & 1040 (contains "li")', async function () {
        const c = new Collection('my_path', {
            ban: {
                type: INDEX_TYPES.TRUTHY,
                nullable: true,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('1000', { id: 1000, name: 'alice', ban: null });
        await c.save('1010', { id: 1010, name: 'bob', ban: { date: 20090812 } });
        await c.save('1015', { id: 1015, name: 'charlie', ban: null });
        await c.save('1020', { id: 1020, name: 'debora', ban: null });
        await c.save('1030', { id: 1030, name: 'eliza', ban: { date: 20201015 } });
        await c.save('1040', { id: 1040, name: 'felix', ban: null });
        const x = await c.find({ name: /([EA])LI/i });
        expect(x.count).toBe(3);
        const x2 = await c.find({ name: /bo/i });
        expect(x2.count).toBe(2);
    });
});

describe('bug 2025-09-30', function () {
    it('should not fire bug', async function () {
        const c = new Collection('my_path', {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
            ban: {
                type: INDEX_TYPES.TRUTHY,
                nullable: true,
            },
        });
        c.storage = new TestStorage();
        await c.init();
        await c.save('ah0n7q2dmr3qwr', {
            id: 'ah0n7q2dmr3qwr',
            name: 'alice',
            password: '9adfb0a6d03beb7141d8ec2708d6d9fef9259d12cd230d50f70fb221ae6cabd5',
            email: 'alice@localhost.com',
            tsCreation: 1759017546305,
            tsLastUsed: 1759017546305,
            roles: [],
            ban: {
                tsBegin: 1759017546305,
                tsEnd: 1759017946305,
                forever: false,
                reason: 'trop débile',
                bannedBy: '',
            },
        });
        await c.save('ah0n81s38is9um', {
            id: 'ah0n81s38is9um',
            name: 'bob',
            password: '9adfb0a6d03beb7141d8ec2708d6d9fef9259d12cd230d50f70fb221ae6cabd5',
            email: 'bob123@localhost.com',
            tsCreation: 1759017536119,
            tsLastUsed: 1759017536119,
            roles: [],
            ban: null,
        });
        await c.save('ah0ns59zafeyd5', {
            id: 'ah0ns59zafeyd5',
            name: 'ralphy',
            password: '9adfb0a6d03beb7141d8ec2708d6d9fef9259d12cd230d50f70fb221ae6cabd5',
            email: 'ralphy@localhost.com',
            tsCreation: 1759016317051,
            tsLastUsed: 1759016317051,
            roles: [],
            ban: null,
        });
        const x = await c.find({ name: 'alice' });
        expect(x.count).toBe(1);
        await c.save('ah0n7q2dmr3qwr', {
            id: 'ah0n7q2dmr3qwr',
            name: 'alice',
            password: '9adfb0a6d03beb7141d8ec2708d6d9fef9259d12cd230d50f70fb221ae6cabd5',
            email: 'alice123@localhost.com',
            tsCreation: 1759017546305,
            tsLastUsed: 1759017546305,
            roles: [],
            ban: {
                tsBegin: 1759017546305,
                tsEnd: 1759017946305,
                forever: false,
                reason: 'trop débile',
                bannedBy: '',
            },
        });
        const x2 = await c.find({ name: 'alice' });
        expect(x2.count).toBe(1);
    });
});
