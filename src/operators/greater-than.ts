import { Collection } from '../Collection';
import { JsonObject } from '../types/Json';
import { comparator } from '../comparator';
import { applyOnBunchOfDocs } from './includes/apply-bunch-of-docs';

export async function greaterThan(
    collection: Collection,
    sPropName: string,
    operand: string | number,
    orEqual: boolean = false
) {
    if (collection.indexManager.isIndexed(sPropName)) {
        const borderKeys = collection.indexManager.getIndexedKeys(sPropName, operand) ?? [];
        const greaterKeys = new Set<string>(
            collection.indexManager.getGreaterIndexKeys(sPropName, operand) ?? []
        );
        await applyOnBunchOfDocs(borderKeys, collection, greaterKeys, (doc) => {
            const v = doc[sPropName];
            if (typeof v === 'string' || typeof v === 'number') {
                return orEqual ? v >= operand : v > operand;
            } else {
                return false;
            }
        });
        return [...greaterKeys];
    } else {
        return collection.filter((data: JsonObject) => {
            const d = data[sPropName];
            if (typeof d === 'string' || typeof d === 'number') {
                return orEqual ? d >= operand : d > operand;
            } else {
                return false;
            }
        });
    }
}
