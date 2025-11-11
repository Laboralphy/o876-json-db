import { Collection } from '../../Collection';
import { JsonObject } from '../../types/Json';

const BUNCH_SIZE = 1000;

export async function applyOnBunchOfDocs<T extends JsonObject>(
    keys: string[],
    collection: Collection<T>,
    validKeys: Set<string>,
    f: (document: T, key: string, index: number) => boolean
): Promise<void> {
    const kl = keys.length;
    let nIndex = 0;
    for (let i = 0; i < kl; i += BUNCH_SIZE) {
        const bunchOfKeys = keys.slice(i, i + BUNCH_SIZE);
        const bunchOfDocuments = await Promise.all(bunchOfKeys.map((key) => collection.load(key)));
        const bl = bunchOfDocuments.length;
        for (let j = 0; j < bl; ++j) {
            const document = bunchOfDocuments[j];
            if (document && f(document, bunchOfKeys[j], nIndex)) {
                validKeys.add(bunchOfKeys[j]);
            }
            ++nIndex;
        }
    }
}
