import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { comparator } from '../comparator';
import { applyOnBunchOfDocs } from './includes/apply-bunch-of-docs';

export async function lesserThan<T extends JsonObject>(
    collection: Collection<T>,
    sPropName: string,
    operand: string | number,
    orEqual: boolean = false
) {
    if (collection.indexManager.isIndexed(sPropName)) {
        const borderKeys = collection.indexManager.getIndexedKeys(sPropName, operand) ?? [];
        const bCaseInsensitive = collection.indexManager.getIndexOptions(sPropName).caseInsensitive;
        const lesserKeys = new Set<string>(
            collection.indexManager.getLesserIndexKeys(sPropName, operand) ?? []
        );
        await applyOnBunchOfDocs(borderKeys, collection, lesserKeys, (doc) => {
            const v = doc[sPropName];
            if (v === null || typeof v === 'string' || typeof v === 'number') {
                return orEqual
                    ? comparator(v, operand, bCaseInsensitive) >= 0
                    : comparator(v, operand, bCaseInsensitive) < 0;
            } else {
                return false;
            }
        });
        return [...lesserKeys];
    } else {
        return collection.filter((data: JsonObject) => {
            const d = data[sPropName];
            if (d === null || typeof d === 'string' || typeof d === 'number') {
                return orEqual ? comparator(d, operand) <= 0 : comparator(d, operand) < 0;
            } else {
                return false;
            }
        });
    }
}
