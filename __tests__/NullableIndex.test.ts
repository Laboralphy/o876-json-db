import { NullableIndex } from '../src/index-implementations/NullableIndex';
import { ExactIndex } from '../src/index-implementations/ExactIndex';

describe('NullableIndex', () => {
    it('should instanciate without errors', () => {
        expect(
            () => new NullableIndex<string, number>(new ExactIndex<string, number>())
        ).not.toThrow();
    });

    it('should return key 10 when indexing "dix"', () => {
        const n = new NullableIndex<string, number>(new ExactIndex<string, number>());
        n.add('dix', 10);
        expect(n.get('dix')).toEqual([10]);
    });

    it('should return keys 10 & 20 when indexing "dix" with keys 10 and 20', () => {
        const n = new NullableIndex<string, number>(new ExactIndex<string, number>());
        n.add('dix', 10);
        n.add('dix', 20);
        expect(n.get('dix')).toEqual([10, 20]);
    });

    it('should return keys 30 when indexing "null" with keys 30 and asking for null', function () {
        const n = new NullableIndex<string, number>(new ExactIndex<string, number>());
        n.add(null, 30);
        expect(n.get(null)).toEqual([30]);
    });

    it('should return 50, 60, 90 when asking "null" and 10, 20, 30, 40, 70, 80 when asking for other values', function () {
        const n = new NullableIndex<string, number>(new ExactIndex<string, number>());
        n.add('dix', 10);
        n.add('vingt', 20);
        n.add('trente', 30);
        n.add('quarante', 40);
        n.add(null, 50);
        n.add(null, 60);
        n.add('soixante-dix', 70);
        n.add('quatre vingt', 80);
        n.add(null, 90);
        expect(n.get(null)).toEqual([50, 60, 90]);
        expect(n.get('dix')).toEqual([10]);
        expect(n.get('trente')).toEqual([30]);
    });

    it('should be able to update primary key, when value changes', function () {
        const n = new NullableIndex<string, number>(new ExactIndex<string, number>());
        n.add('dix', 10);
        n.add(null, 20);
        expect(n.get(null)).toEqual([20]);
        expect(n.get('dix')).toEqual([10]);
        n.remove('dix', 10);
        n.remove(null, 20);
        expect(n.get(null)).toEqual([]);
        expect(n.get('dix')).toEqual([]);
        n.add(null, 10);
        n.add('vingt', 20);
        expect(n.get(null)).toEqual([10]);
        expect(n.get('vingt')).toEqual([20]);
    });
});
