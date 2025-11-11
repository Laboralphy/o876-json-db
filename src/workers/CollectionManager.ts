import { Collection, IndexCreationOptions } from '../Collection';
import { JsonObject } from '../types/Json';
import { QueryObject } from '../types/QueryObject';
import { Cursor } from '../Cursor';

export class CollectionManager {
    private _collections: Map<string, Collection<JsonObject>> = new Map();

    createCollection<T extends JsonObject>(
        id: string,
        sPath: string,
        oIndex: { [indexName: string]: IndexCreationOptions } = {}
    ): string {
        const collection = new Collection<T>(sPath, oIndex);
        this._collections.set(id, collection);
        return id;
    }

    getCollection<T extends JsonObject>(id: string): Collection<T> {
        const collection = this._collections.get(id);
        if (!collection) {
            throw new ReferenceError(`Collection ${id} not found`);
        }
        return collection as Collection<T>;
    }

    save<T extends JsonObject>(sCollectionId: string, key: string, oDocument: T): Promise<void> {
        return this.getCollection<T>(sCollectionId).save(key, oDocument);
    }

    load<T extends JsonObject>(sCollectionId: string, key: string): Promise<T | undefined> {
        return this.getCollection<T>(sCollectionId).load(key);
    }

    delete<T extends JsonObject>(sCollectionId: string, key: string): Promise<void> {
        return this.getCollection<T>(sCollectionId).delete(key);
    }

    find<T extends JsonObject>(
        sCollectionId: string,
        oQueryObject: QueryObject
    ): Promise<Cursor<T>> {
        return this.getCollection<T>(sCollectionId).find(oQueryObject);
    }
}
