import { Cursor } from '../src/Cursor';
import { ILoader } from '../src/interfaces/ILoader';

describe('Cursor', () => {
    it("should return {result: '111'}", async () => {
        const l: ILoader = {
            async load(k) {
                const n = parseInt(k);
                if (!isNaN(n) && n > 0 && n <= 9) {
                    return { result: n * 100 + n * 10 + n };
                } else {
                    return undefined;
                }
            },
        };
        const c = new Cursor(['1', '2', '3'], l);
        expect(c.count).toBe(3);
        expect(c.index).toBe(0);
        expect(c.currentKey).toBe('1');
        await expect(c.first()).resolves.toEqual({ result: 111 });
        expect(c.index).toBe(0);
        await expect(c.next()).resolves.toEqual({ result: 222 });
        expect(c.index).toBe(1);
        await expect(c.next()).resolves.toEqual({ result: 333 });
        expect(c.index).toBe(2);
        await expect(c.next()).resolves.toBeUndefined();
        await expect(c.last()).resolves.toEqual({ result: 333 });
        await expect(c.previous()).resolves.toEqual({ result: 222 });
        await expect(c.previous()).resolves.toEqual({ result: 111 });
        await expect(c.previous()).resolves.toEqual(undefined);
        await expect(c.fetchAll()).resolves.toEqual([
            { result: 111 },
            { result: 222 },
            { result: 333 },
        ]);
        await expect(c.fetchAll(1, 2)).resolves.toEqual([{ result: 222 }]);
        await expect(c.fetchAll(1, 10)).resolves.toEqual([{ result: 222 }, { result: 333 }]);
        await expect(c.fetchAll(0, 1)).resolves.toEqual([{ result: 111 }]);
    });
});
