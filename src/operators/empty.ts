import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';

export function empty(collection: Collection, sPropName: string, operand: boolean) {
    if (collection.indexManager.isIndexed(sPropName)) {
        return collection.indexManager.getIndexedKeys(sPropName, !operand) ?? [];
    } else {
        return collection.filter((data: JsonObject) => operand == !data[sPropName]);
    }
}
