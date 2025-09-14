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
    it('should return [] when getting list of an undefined location', async function () {
        const ms = new MemoryStorage();
        await ms.createLocation('test-location');
        const s = await ms.getList('bad-location');
        expect(s).toBeInstanceOf(Array);
        expect(s).toHaveLength(0);
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
