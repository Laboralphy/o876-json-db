import { comparator } from '../src/comparator'; // Ajuste le chemin selon ton projet

describe('comparator', () => {
    // null est toujours inférieur aux autres types
    test('null < false', () => {
        expect(comparator(null, false)).toBe(-1);
    });

    test('null = null', () => {
        expect(comparator(null, null)).toBe(0);
    });

    test('null < true', () => {
        expect(comparator(null, true)).toBe(-1);
    });

    test('null < 10', () => {
        expect(comparator(null, 10)).toBe(-1);
    });

    test('null < "hello"', () => {
        expect(comparator(null, 'hello')).toBe(-1);
    });

    // boolean : false < true
    test('false < true', () => {
        expect(comparator(false, true)).toBe(-1);
    });

    test('false = false', () => {
        expect(comparator(false, false)).toBe(0);
    });

    test('true > false', () => {
        expect(comparator(true, false)).toBe(1);
    });

    // boolean < number
    test('false < 10', () => {
        expect(comparator(false, 10)).toBe(-1);
    });

    test('true < 5', () => {
        expect(comparator(true, 5)).toBe(-1);
    });

    // boolean < string
    test('false < "hello"', () => {
        expect(comparator(false, 'hello')).toBe(-1);
    });

    test('true < "world"', () => {
        expect(comparator(true, 'world')).toBe(-1);
    });

    // number < string
    test('10 < "hello"', () => {
        expect(comparator(10, 'hello')).toBe(-1);
    });

    test('5 = 5', () => {
        expect(comparator(5, 5)).toBe(0);
    });

    test('5 < 10', () => {
        expect(comparator(5, 10)).toBe(-5);
    });

    test('10 > 5', () => {
        expect(comparator(10, 5)).toBe(5);
    });

    // string
    test('"a" < "b"', () => {
        expect(comparator('a', 'b')).toBe(-1);
    });

    test('"hello" = "hello"', () => {
        expect(comparator('hello', 'hello')).toBe(0);
    });

    test('"z" > "a"', () => {
        expect(comparator('z', 'a')).toBe(1);
    });

    // number
    test('5 = 5', () => {
        expect(comparator(5, 5)).toBe(0);
    });

    // Cas inverses
    test('10 > null', () => {
        expect(comparator(10, null)).toBe(1);
    });

    test('"hello" > true', () => {
        expect(comparator('hello', true)).toBe(1);
    });

    test('"hello" > 10', () => {
        expect(comparator('hello', 10)).toBe(1);
    });
});
