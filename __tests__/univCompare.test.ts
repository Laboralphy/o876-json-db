import { univCompare } from '../src/univ-compare'; // Ajuste le chemin selon ton projet

describe('univCompare', () => {
    // null est toujours inférieur aux autres types
    test('null < false', () => {
        expect(univCompare(null, false)).toBe(-1);
    });

    test('null = null', () => {
        expect(univCompare(null, null)).toBe(0);
    });

    test('null < true', () => {
        expect(univCompare(null, true)).toBe(-1);
    });

    test('null < 10', () => {
        expect(univCompare(null, 10)).toBe(-1);
    });

    test('null < "hello"', () => {
        expect(univCompare(null, 'hello')).toBe(-1);
    });

    // boolean : false < true
    test('false < true', () => {
        expect(univCompare(false, true)).toBe(-1);
    });

    test('false = false', () => {
        expect(univCompare(false, false)).toBe(0);
    });

    test('true > false', () => {
        expect(univCompare(true, false)).toBe(1);
    });

    // boolean < number
    test('false < 10', () => {
        expect(univCompare(false, 10)).toBe(-1);
    });

    test('true < 5', () => {
        expect(univCompare(true, 5)).toBe(-1);
    });

    // boolean < string
    test('false < "hello"', () => {
        expect(univCompare(false, 'hello')).toBe(-1);
    });

    test('true < "world"', () => {
        expect(univCompare(true, 'world')).toBe(-1);
    });

    // number < string
    test('10 < "hello"', () => {
        expect(univCompare(10, 'hello')).toBe(-1);
    });

    test('5 = 5', () => {
        expect(univCompare(5, 5)).toBe(0);
    });

    test('5 < 10', () => {
        expect(univCompare(5, 10)).toBe(-5);
    });

    test('10 > 5', () => {
        expect(univCompare(10, 5)).toBe(5);
    });

    // string
    test('"a" < "b"', () => {
        expect(univCompare('a', 'b')).toBe(-1);
    });

    test('"hello" = "hello"', () => {
        expect(univCompare('hello', 'hello')).toBe(0);
    });

    test('"z" > "a"', () => {
        expect(univCompare('z', 'a')).toBe(1);
    });

    // number
    test('5 = 5', () => {
        expect(univCompare(5, 5)).toBe(0);
    });

    // Cas inverses
    test('10 > null', () => {
        expect(univCompare(10, null)).toBe(1);
    });

    test('"hello" > true', () => {
        expect(univCompare('hello', true)).toBe(1);
    });

    test('"hello" > 10', () => {
        expect(univCompare('hello', 10)).toBe(1);
    });
});
