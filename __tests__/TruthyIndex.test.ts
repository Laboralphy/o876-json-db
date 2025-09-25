import { TruthyIndex } from '../src/index-implementations/TruthyIndex';

describe('TruthyIndex', () => {
    let index: TruthyIndex;

    beforeEach(() => {
        index = new TruthyIndex();
    });

    test('should index only truthy value of any type', () => {
        index.add(true, '1');
        index.add(1, '2');
        index.add({ test: 100 }, '3');
        index.add(null, '4');
        index.add(false, '5');
        index.add(0, '6');
        expect(index.get(true)).toEqual(['1', '2', '3']);
    });
});
