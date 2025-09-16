import { IndexManager } from '../src/IndexManager';
import { INDEX_TYPES } from '../src/enums';

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
            im.createIndex('prop', INDEX_TYPES.HASH, { nullable: false });
            expect(() => im.indexDocument('k10', { prop: null })).toThrow(
                new TypeError('prop does not support null values : must be declared as nullable')
            );
        });
    });

    describe('when creating a nullable hash index', () => {
        it('should return [k10] when indexing k10 document with one null field', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH, { nullable: true });
            im.indexDocument('k10', { prop: null });
            expect(im.getIndexedKeys('prop', null)).toEqual(['k10']);
        });
        it('should return [k10] when indexing k10 document with one null field', () => {
            const im = new IndexManager();
            im.createIndex('prop', INDEX_TYPES.HASH, { nullable: true });
            im.indexDocument('k10', { prop: null });
            expect(im.getIndexedKeys('prop', null)).toEqual(['k10']);
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
});
