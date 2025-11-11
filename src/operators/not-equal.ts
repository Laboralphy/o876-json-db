import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { equal } from './equal';

export async function notEqual<T extends JsonObject>(
    collection: Collection<T>,
    sPropName: string,
    operand: string | number | null
) {
    const aEqualKeys = new Set(await equal(collection, sPropName, operand));
    return collection.keys.filter((x) => !aEqualKeys.has(x));
}
