import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { comparator } from '../comparator';
import { applyOnBunchOfDocs } from './includes/apply-bunch-of-docs';

export async function equal<T extends JsonObject>(
    collection: Collection<T>,
    sPropName: string,
    operand: string | number | null
) {
    if (collection.indexManager.isIndexed(sPropName)) {
        const borderKeys = collection.indexManager.getIndexedKeys(sPropName, operand) ?? [];
        const bCaseInsensitive = collection.indexManager.getIndexOptions(sPropName).caseInsensitive;
        const equalKeys = new Set<string>();
        await applyOnBunchOfDocs(borderKeys, collection, equalKeys, (doc) => {
            const v = doc[sPropName];
            if (v === null || typeof v === 'string' || typeof v === 'number') {
                return comparator(v, operand, bCaseInsensitive) == 0;
            } else {
                return false;
            }
        });
        return [...equalKeys];
    } else {
        return collection.filter((data: JsonObject) => {
            const d = data[sPropName];
            if (d === null || typeof d === 'string' || typeof d === 'number') {
                return comparator(d, operand) == 0;
            } else {
                return false;
            }
        });
    }
}
