import { NumericIndex } from '../src/index-implementations/NumericIndex';

describe('NumericIndex', () => {
    it('should instanciate without errors', () => {
        expect(() => new NumericIndex(1)).not.toThrow();
    });
    it('test', () => {
        const oIndex = new NumericIndex();
        oIndex.add(10, 'k10');
        oIndex.add(20, 'k20');
        oIndex.add(5, 'k5');
        oIndex.add(66, 'k66');
        expect(oIndex.get(5)).toEqual(['k5']);
    });
});
