import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';

export async function empty(
    collection: Collection,
    sPropName: string,
    operand: boolean
): Promise<string[]> {
    if (collection.indexManager.isIndexed(sPropName)) {
        return collection.indexManager.getIndexedKeys(sPropName, !operand) ?? [];
    } else {
        return collection.filter((data: JsonObject) => operand == !data[sPropName]);
    }
}
