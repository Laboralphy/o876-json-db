// ExactIndex.test.ts
import { ExactIndex } from '../src/index-implementations/ExactIndex';

describe('ExactIndex', () => {
    let index: ExactIndex<string, number>;

    beforeEach(() => {
        index = new ExactIndex<string, number>();
    });

    test('adds an entry and retreive ir', () => {
        index.add('pomme', 1);
        expect(index.get('pomme')).toEqual([1]);
    });

    test('adds several keys for a same value', () => {
        index.add('pomme', 1);
        index.add('pomme', 2);
        expect(index.get('pomme')).toEqual([1, 2]);
    });

    test('returns empty array when asking for an unindexed value', () => {
        expect(index.get('banane')).toEqual([]);
    });

    test('removes a specific key for a given value', () => {
        index.add('pomme', 1);
        index.add('pomme', 2);
        index.remove('pomme', 1);
        expect(index.get('pomme')).toEqual([2]);
    });

    test('checks if a value has been indexed', () => {
        index.add('pomme', 1);
        expect(index.has('pomme')).toBe(true);
        expect(index.has('banane')).toBe(false);
    });

    test('do not crash when removing non existent primary key', () => {
        index.add('pomme', 1);
        index.remove('pomme', 999); // Clé inexistante
        expect(index.get('pomme')).toEqual([1]);
    });

    test('do not duplicate same primary keys', () => {
        index.add('pomme', 1);
        index.add('pomme', 1);
        expect(index.get('pomme')).toEqual([1]);
    });
});
