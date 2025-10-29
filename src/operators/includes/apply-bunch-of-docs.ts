import { Collection } from '../../Collection';
import { JsonObject } from '../../types/Json';

const BUNCH_SIZE = 1000;

export async function applyOnBunchOfDocs(
    keys: string[],
    collection: Collection,
    validKeys: Set<string>,
    f: (document: JsonObject, key: string) => boolean
): Promise<void> {
    for (let i = 0; i < keys.length; i += BUNCH_SIZE) {
        const bunchOfKeys = keys.slice(i, i + BUNCH_SIZE);
        const bunchOfDocuments = await Promise.all(bunchOfKeys.map((key) => collection.load(key)));
        for (let j = 0; j < bunchOfDocuments.length; ++j) {
            const document = bunchOfDocuments[j];
            if (document && f(document, bunchOfKeys[j])) {
                validKeys.add(bunchOfKeys[j]);
            }
        }
    }
}
