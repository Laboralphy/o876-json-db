import { equal } from '../src/cmp-functions/equal';
import { notEqual } from '../src/cmp-functions/not-equal';
import { greaterThan } from '../src/cmp-functions/greater-than';

describe('equal', function () {
    it('equality of 2 numbers', function () {
        expect(equal(0)(0)).toBe(true);
        expect(equal(0)(1)).toBe(false);
        expect(equal(1)(1)).toBe(true);
        expect(equal(-1)(-1)).toBe(true);
        expect(equal(0)(0.0001)).toBe(false);
    });
    it('equality of 2 strings', function () {
        expect(equal('alpha')('alpha')).toBe(true);
        expect(equal('alpha')('Alpha')).toBe(false);
        expect(equal('alpha')('AlPhA')).toBe(false);
        expect(equal('alpha')('beta')).toBe(false);
        expect(equal('alpha')(0.0001)).toBe(false);
    });
    it('equality of number and string', function () {
        expect(equal('0')(0)).toBe(false);
        expect(equal('0')(1)).toBe(false);
        expect(equal('0')('2')).toBe(false);
        expect(equal('0')('1e0')).toBe(false);

        expect(equal('1')(0)).toBe(false);
        expect(equal('1')(1)).toBe(false);
        expect(equal('1')('2')).toBe(false);
        expect(equal('1')('1e0')).toBe(false);

        expect(equal('alpha')(0)).toBe(false);
        expect(equal('alpha')(1)).toBe(false);
        expect(equal('alpha')('2')).toBe(false);
        expect(equal('alpha')('1e0')).toBe(false);
    });
    it('should return false when comparing undefined value with defined operand', function () {
        expect(equal(null)(undefined)).toBe(false);
        expect(equal(0)(undefined)).toBe(false);
        expect(equal(1)(undefined)).toBe(false);
        expect(equal('alpha')(undefined)).toBe(false);
        expect(equal(true)(undefined)).toBe(false);
        expect(equal(false)(undefined)).toBe(false);
    });
    it('should be able to compare null to other types', function () {
        expect(equal(null)(undefined)).toBe(false);
        expect(equal(null)(null)).toBe(true);
        expect(equal(null)(2)).toBe(false);
        expect(equal(null)('alpha')).toBe(false);
        expect(equal(null)(false)).toBe(false);
        expect(equal(null)(true)).toBe(false);
    });
    it('equality of boolean and values', function () {
        expect(equal(true)(undefined)).toBe(false);
        expect(equal(true)(null)).toBe(false);
        expect(equal(true)(2)).toBe(false);
        expect(equal(true)('alpha')).toBe(false);
        expect(equal(true)(false)).toBe(false);
        expect(equal(true)(true)).toBe(true);

        expect(equal(false)(undefined)).toBe(false);
        expect(equal(false)(null)).toBe(false);
        expect(equal(false)(2)).toBe(false);
        expect(equal(false)('alpha')).toBe(false);
        expect(equal(false)(false)).toBe(true);
        expect(equal(false)(true)).toBe(false);
    });
});

describe('notEqual', function () {
    it('should be able to compute inequality of 2 numbers', function () {
        expect(notEqual(0)(0)).toBe(false);
        expect(notEqual(0)(1)).toBe(true);
        expect(notEqual(1)(1)).toBe(false);
        expect(notEqual(-1)(-1)).toBe(false);
        expect(notEqual(0)(0.0001)).toBe(true);
    });
    it('should be able to compute inequality of 2 strings', function () {
        expect(notEqual('alpha')('alpha')).toBe(false);
        expect(notEqual('alpha')('Alpha')).toBe(true);
        expect(notEqual('alpha')('AlPhA')).toBe(true);
        expect(notEqual('alpha')('beta')).toBe(true);
        expect(notEqual('alpha')(0.0001)).toBe(true);
    });
    it('inequality of number and string', function () {
        expect(notEqual('0')(0)).toBe(true);
        expect(notEqual('0')(1)).toBe(true);
        expect(notEqual('0')('2')).toBe(true);
        expect(notEqual('0')('1e0')).toBe(true);

        expect(notEqual('1')(0)).toBe(true);
        expect(notEqual('1')(1)).toBe(true);
        expect(notEqual('1')('1')).toBe(false);
        expect(notEqual('1')('2')).toBe(true);
        expect(notEqual('1')('1e0')).toBe(true);

        expect(notEqual('alpha')(0)).toBe(true);
        expect(notEqual('alpha')(1)).toBe(true);
        expect(notEqual('alpha')('2')).toBe(true);
        expect(notEqual('alpha')('1e0')).toBe(true);
    });
});

describe('greterThan', function () {
    it('should return false when operant is 5 and value is 10', function () {
        expect(greaterThan(5)(10)).toBe(true);
        expect(greaterThan(15)(10)).toBe(false);
    });
});
