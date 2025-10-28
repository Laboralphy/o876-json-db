import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { comparator } from '../comparator';

export async function lesserThan(
    collection: Collection,
    sPropName: string,
    operand: string | number,
    orEqual: boolean = false
) {
    if (collection.indexManager.isIndexed(sPropName)) {
        const borderKeys = collection.indexManager.getIndexedKeys(sPropName, operand) ?? [];
        const lesserKeys = new Set<string>(
            collection.indexManager.getLesserIndexKeys(sPropName, operand) ?? []
        );
        for (const key of borderKeys) {
            const doc = await collection.load(key);
            if (doc !== undefined) {
                const v = doc[sPropName] ?? null;
                if (typeof v === 'string' || typeof v === 'number') {
                    const bOk = orEqual ? comparator(v, operand) <= 0 : comparator(v, operand) < 0;
                    if (doc && bOk) {
                        lesserKeys.add(key);
                    }
                }
            }
        }
        return [...lesserKeys];
    } else {
        return collection.filter((data: JsonObject) => {
            const d = data[sPropName];
            if (typeof d === 'string' || typeof d === 'number') {
                return orEqual ? comparator(d, operand) <= 0 : comparator(d, operand) < 0;
            } else {
                return false;
            }
        });
    }
}
