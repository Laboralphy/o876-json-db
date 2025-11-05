import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { MemoryStorage } from '../../../src/storage-adapters/MemoryStorage';
import { generateUID } from '../libs/uid-generator';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';

export class UserRepository {
    #collection: Collection = new Collection('user', {});
    constructor() {
        const storage = new TestStorage();
        storage.latency = 8;
        this.#collection.storage = storage;
    }

    init() {
        return this.#collection.init();
    }

    createUser(name: string) {
        const user = {
            name: name,
        };
        const id = generateUID();
        if (this.#collection.keys.includes(id)) {
            throw new ReferenceError(`this user id already exist ${id}`);
        }
        return this.#collection.save(id, user);
    }
}
