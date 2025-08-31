import { ScalarValue } from './types';

const SHORT_TYPES = new Map<string, string>([
    ['number', 'n'],
    ['string', 's'],
    ['undefined', 'u'],
    ['null', '-'],
    ['boolean', 'b'],
    ['array', 'a'],
    ['object', 'o'],
    ['unknown', ''],
]);

type AnyValue = ScalarValue | object | [] | undefined;

export function getType(x: AnyValue): string {
    const tox = typeof x;
    switch (tox) {
        case 'undefined': {
            return 'undefined';
        }
        case 'object': {
            if (x === null) {
                return 'null';
            }
            if (Array.isArray(x)) {
                return 'array';
            }
            return 'object';
        }
        default: {
            return tox;
        }
    }
}

export function getShortTypes(x1: AnyValue, x2: AnyValue): string {
    const s1 = SHORT_TYPES.get(getType(x1)) ?? 'unknown';
    const s2 = SHORT_TYPES.get(getType(x2)) ?? 'unknown';
    return s1 + s2;
}
