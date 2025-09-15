import { MemoryStorage } from '../src/storage-adapters/MemoryStorage';

describe('Instanciation', function () {
    it('should instanciate without error', function () {
        expect(() => new MemoryStorage()).not.toThrow();
    });
});

describe('getList', function () {
    it('should return empty map when creating new StorageLocation', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        const s = await ms.getList('test-location');
        expect(s).toBeInstanceOf(Array);
        expect(s).toHaveLength(0);
    });
    it('should throw an error when getting list of an undefined location', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        await expect(() => ms.getList('bad-location')).rejects.toThrow();
    });
});

describe('read', function () {
    it('should return undefined when reading something not written', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        const x = await ms.read('test-location', 'undef-identifier');
        expect(x).toBeUndefined();
    });
});

describe('write/read', function () {
    it('should return "file content" when writing "file content" in a file and reading it', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        await ms.write('test-location', 'my-file', { data: 'file content' });
        const r = await ms.read('test-location', 'my-file');
        expect(r).toEqual({ data: 'file content' });
    });
    it('should throw error when writing "file content" in a file in an invalid location', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        await expect(() => {
            return ms.write('test-location2', 'my-file', { data: 'file content' });
        }).rejects.toThrow(new Error('storage location test-location2 not found'));
    });
});
