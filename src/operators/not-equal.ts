import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { comparator } from '../comparator';
import { applyOnBunchOfDocs } from './includes/apply-bunch-of-docs';
import { equal } from './equal';

export async function notEqual(
    collection: Collection,
    sPropName: string,
    operand: string | number | null
) {
    const aEqualKeys = new Set(await equal(collection, sPropName, operand));
    return collection.keys.filter((x) => !aEqualKeys.has(x));
}
