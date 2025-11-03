import { Collection } from '../src/Collection';
import { INDEX_TYPES } from '../src/enums';
import { TestStorage } from '../src/storage-adapters/TestStorage';

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

    describe('when using operator greaterThan', () => {
        it('should find documents with age 56 and 1024 when searching values of age greater than 50', async () => {
            const c = new Collection('my_path', {
                age: {
                    type: INDEX_TYPES.NUMERIC,
                },
            });
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 25 });
            await c.save('1010', { id: 1010, name: 'bob', age: 29 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 20 });
            await c.save('1020', { id: 1020, name: 'debora', age: 56 });
            await c.save('1030', { id: 1030, name: 'eliza', age: 18 });
            await c.save('1040', { id: 1040, name: 'felix', age: 1024 });
            const elders = await c.find({ age: { $gt: 50 } });
            expect(elders.count).toBe(2);
            const a = await elders.fetchAll();
            const b = a.map((e) => e.age);
            expect(b.length).toBe(2);
            expect(b.includes(56)).toBe(true);
            expect(b.includes(1024)).toBe(true);
        });
        it('should exclude 50 when using a numeric index with precision 10', async () => {
            const c = new Collection('my_path', {
                age: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 10,
                },
            });
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 47 });
            await c.save('1010', { id: 1010, name: 'bob', age: 48 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 49 });
            await c.save('1020', { id: 1020, name: 'debora', age: 50 }); // <- should not be count
            await c.save('1030', { id: 1030, name: 'eliza', age: 51 });
            await c.save('1040', { id: 1040, name: 'felix', age: 52 });
            const elders = await c.find({ age: { $gt: 50 } });
            expect(elders.count).toBe(2);
            const a = await elders.fetchAll();
            const b = a.map((e) => e.name);
            expect(b.length).toBe(2);
            expect(b.includes('eliza')).toBe(true); // age 51
            expect(b.includes('felix')).toBe(true); // age 52
        });
    });

    describe('when using operator lesserThan', () => {
        it('should find documents with age 25, 29, 20, 18 when searching values of age lesser than 50', async () => {
            const c = new Collection('my_path', {
                age: {
                    type: INDEX_TYPES.NUMERIC,
                },
            });
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 25 });
            await c.save('1010', { id: 1010, name: 'bob', age: 29 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 20 });
            await c.save('1020', { id: 1020, name: 'debora', age: 56 });
            await c.save('1030', { id: 1030, name: 'eliza', age: 18 });
            await c.save('1040', { id: 1040, name: 'felix', age: 1024 });
            const elders = await c.find({ age: { $lt: 50 } });
            expect(elders.count).toBe(4);
            const a = await elders.fetchAll();
            const b = a.map((e) => e.age);
            expect(b.length).toBe(4);
            expect(b.includes(25)).toBe(true);
            expect(b.includes(29)).toBe(true);
            expect(b.includes(20)).toBe(true);
            expect(b.includes(18)).toBe(true);
        });
        it('should exclude 51 when using a numeric index with precision 10', async () => {
            const c = new Collection('my_path', {
                age: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 10,
                },
            });
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 47 });
            await c.save('1010', { id: 1010, name: 'bob', age: 48 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 49 });
            await c.save('1020', { id: 1020, name: 'debora', age: 50 }); // <- should not be count
            await c.save('1030', { id: 1030, name: 'eliza', age: 51 });
            await c.save('1040', { id: 1040, name: 'felix', age: 52 });
            await c.save('1060', { id: 1040, name: 'felix', age: 60 });
            const elders = await c.find({ age: { $lt: 51 } });
            expect(elders.count).toBe(4); // 47, 48, 49, 50
            const a = await elders.fetchAll();
            const b = a.map((e) => e.name);
            expect(b.length).toBe(4);
            expect(b.includes('alice')).toBe(true); // age 47
            expect(b.includes('bob')).toBe(true); // age 48
            expect(b.includes('charlie')).toBe(true); // age 49
            expect(b.includes('debora')).toBe(true); // age 50
        });
    });

    describe('when using a combination of lte and gte to get an inclusive range', () => {
        it('should find documents with age between  25 & 60', async () => {
            const c = new Collection('my_path', {
                age: {
                    type: INDEX_TYPES.NUMERIC,
                    precision: 10,
                },
            });
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 25 });
            await c.save('1010', { id: 1010, name: 'bob', age: 29 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 20 });
            await c.save('1020', { id: 1020, name: 'debora', age: 56 });
            await c.save('1030', { id: 1030, name: 'eliza', age: 18 });
            await c.save('1040', { id: 1040, name: 'felix', age: 1024 });
            const searched = await c.find({ age: { $gte: 25, $lt: 60 } });
            const a = await searched.fetchAll();
            expect(a).toEqual([
                { id: 1000, name: 'alice', age: 25 },
                { id: 1010, name: 'bob', age: 29 },
                { id: 1020, name: 'debora', age: 56 },
            ]);
        });
        it('should find documents with age between  25 & 60 when using no index', async () => {
            const c = new Collection('my_path', {});
            c.storage = new TestStorage();
            await c.init();
            await c.save('1000', { id: 1000, name: 'alice', age: 25 });
            await c.save('1010', { id: 1010, name: 'bob', age: 29 });
            await c.save('1015', { id: 1015, name: 'charlie', age: 20 });
            await c.save('1020', { id: 1020, name: 'debora', age: 56 });
            await c.save('1030', { id: 1030, name: 'eliza', age: 18 });
            await c.save('1040', { id: 1040, name: 'felix', age: 1024 });
            const searched = await c.find({ age: { $gte: 25, $lt: 60 } });
            const a = await searched.fetchAll();
            expect(a).toEqual([
                { id: 1000, name: 'alice', age: 25 },
                { id: 1010, name: 'bob', age: 29 },
                { id: 1020, name: 'debora', age: 56 },
            ]);
        });
    });
});
