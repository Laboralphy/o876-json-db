import { IndexManager } from '../src/IndexManager';
import { INDEX_TYPES } from '../src/enums';
import { timingSafeEqual } from 'node:crypto';

describe('IndexManager', () => {
    it('should return [] when nothing is indexed', () => {
        const im = new IndexManager();
        expect(im.getIndexedKeys('test', 'test'));
    });

    describe('when creating a hash index', () => {
        it('should return [k10] when indexing k10 document with one string field', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH);
            im.indexDocument('k10', { prop: 'test-prop' });
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k10']);
        });
        it('should return [k10, k12] when indexing k10 and k12 documents with one string field', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH);
            im.indexDocument('k10', { prop: 'test-prop' });
            im.indexDocument('k11', { prop: 'not-test-prop' });
            im.indexDocument('k12', { prop: 'test-prop' });
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k10', 'k12']);
        });
        it('should return [k1000, k2000] when indexing a lot of documents', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH);
            for (let i = 1; i < 10000; ++i) {
                if (i != 1000 && i != 2000) {
                    im.indexDocument('k' + i.toString(), {
                        prop: 'not-' + i.toString() + 'test-prop',
                    });
                } else {
                    im.indexDocument('k' + i.toString(), { prop: 'test-prop' });
                }
            }
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k1000', 'k2000']);
        });
        it('should update keys when modifiying document', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH);
            im.indexDocument('k10', { prop: 'test-prop' });
            im.indexDocument('k11', { prop: 'not-test-prop' });
            im.indexDocument('k12', { prop: 'test-prop' });
            im.indexDocument('k13', { prop: 'not-test-prop-954125' });
            im.indexDocument('k14', { prop: 'not-test-prop-88545445' });
            im.indexDocument('k15', { prop: 'not-test-prop-632348' });
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k10', 'k12']);
            im.unindexDocument('k14', { prop: 'not_test_prop_88545445' });
            im.indexDocument('k14', { prop: 'test-prop' });
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k10', 'k12', 'k14']);
            im.unindexDocument('k12', { prop: 'test-prop' });
            im.indexDocument('k12', { prop: 'not-test-prop-885478526' });
            expect(im.getIndexedKeys('prop', 'test-prop')).toEqual(['k10', 'k14']);
        });
        it('should throw error when indexing k10 document with one null field', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH, {});
            expect(() => im.indexDocument('k10', { prop: null })).toThrow(
                new TypeError(
                    'null or undefined values are unsupported for string index : property prop'
                )
            );
        });
    });

    describe('when creating an numeric index with a precision 10', () => {
        it('should return 5 & 6', () => {
            const im = new IndexManager();
            im.createIndex('qty', INDEX_TYPES.NUMERIC, { precision: 10 });
            im.indexDocument('1', { qty: 50 });
            im.indexDocument('2', { qty: -1 });
            im.indexDocument('5', { qty: 1 });
            im.indexDocument('6', { qty: 9 });
            im.indexDocument('7', { qty: 10 });
            expect(im.getIndexedKeys('qty', 5)).toEqual(['5', '6']);
        });
    });

    describe('when creating a truthyIndex', () => {
        it('should return 1', () => {
            const im = new IndexManager();
            im.createIndex('enabled', INDEX_TYPES.BOOLEAN, {});
            im.indexDocument('1', { enabled: true });
            im.indexDocument('2', { enabled: false });
            expect(im.getIndexedKeys('enabled', true)).toEqual(['1']);
        });
        it('should return 2 when asking for ban = null', () => {
            const im = new IndexManager();
            im.createIndex('ban', INDEX_TYPES.TRUTHY, {});
            im.indexDocument('1', { name: 'user1', ban: { reason: 'too lame' } });
            im.indexDocument('2', { name: 'user1', ban: null });
            expect(im.getIndexedKeys('ban', false)).toEqual(['2']);
        });
    });

    describe('getGreaterIndexKeys', () => {
        it('should return 3, 4, 5 when doc 3, 4, 5 have age greater than 50', () => {
            const im = new IndexManager();
            im.createIndex('age', INDEX_TYPES.NUMERIC, { precision: 1 });
            im.indexDocument('1', { name: Math.random().toString(), age: -991 });
            im.indexDocument('1', { name: Math.random().toString(), age: 50 });
            im.indexDocument('3', { name: Math.random().toString(), age: 51 });
            im.indexDocument('4', { name: Math.random().toString(), age: 80 });
            im.indexDocument('5', { name: Math.random().toString(), age: 75 });
            im.indexDocument('6', { name: Math.random().toString(), age: 8 });
            const keys = im.getGreaterIndexKeys('age', 50);
            expect(keys).toBeDefined();
            expect(keys!.length).toEqual(3);
            expect(keys!.includes('3')).toBeTruthy();
            expect(keys!.includes('4')).toBeTruthy();
            expect(keys!.includes('5')).toBeTruthy();
        });
        it('should return all key with value greater than 50', () => {
            const im = new IndexManager();
            im.createIndex('age', INDEX_TYPES.NUMERIC, { precision: 1 });
            const db = new Map<string, { person: string; age: number }>();
            let id = 0;
            for (let i = 0; i < 100; ++i) {
                const d1 = {
                    person: Math.random().toString(36),
                    age: (Math.random() * 75) | 0,
                };
                const d2 = {
                    person: Math.random().toString(36),
                    age: (Math.random() * 75 + 25) | 0,
                };
                const d3 = {
                    person: Math.random().toString(36),
                    age: (Math.random() * 50) | 0,
                };
                const d4 = {
                    person: Math.random().toString(36),
                    age: (Math.random() * 50 + 50) | 0,
                };
                const id1 = (++id).toString();
                const id2 = (++id).toString();
                const id3 = (++id).toString();
                const id4 = (++id).toString();
                db.set(id1, d1);
                db.set(id2, d2);
                db.set(id3, d3);
                db.set(id4, d4);
                im.indexDocument(id1, d1);
                im.indexDocument(id2, d2);
                im.indexDocument(id3, d3);
                im.indexDocument(id4, d4);
            }
            const keys = im.getGreaterIndexKeys('age', 50);
            expect(keys!.every((d) => db.get(d)!.age)).toBeTruthy();
        });
        it('should work with strings, should return 26, 77, 52, 123', () => {
            const im = new IndexManager();
            im.createIndex('name', INDEX_TYPES.PARTIAL, { size: 1 });
            im.indexDocument('98', { name: 'alice' });
            im.indexDocument('2', { name: 'bob' });
            im.indexDocument('152', { name: 'charlie' });
            im.indexDocument('26', { name: 'zack' });
            im.indexDocument('77', { name: 'yves' });
            im.indexDocument('75', { name: 'maya' });
            im.indexDocument('52', { name: 'will' });
            im.indexDocument('123', { name: 'xavier' });
            const keys = im.getGreaterIndexKeys('name', 'm');
            expect(keys).toBeDefined();
            expect(keys!.length).toEqual(4);
            expect(keys!.includes('26')).toBeTruthy();
            expect(keys!.includes('77')).toBeTruthy();
            expect(keys!.includes('52')).toBeTruthy();
            expect(keys!.includes('123')).toBeTruthy();
        });
    });
});
