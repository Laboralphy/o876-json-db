import { Collection } from '../src/Collection';
import { MemoryStorage } from '../src/storage-adapters/MemoryStorage';

describe('Collection.path', function () {
    it('should initialize path', function () {
        const c = new Collection('my_path');
        expect(c.path).toBe('my_path');
    });
});

describe('Collection.storage', function () {
    it('should set storage', function () {
        const s = new Collection('my_path');
    });
});
