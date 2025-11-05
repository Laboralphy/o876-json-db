import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { generateUID } from '../libs/uid-generator';
import { Message } from '../entities/Message';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';

export class MessageRepository {
    #collection: Collection = new Collection('message', {
        authorId: {
            type: INDEX_TYPES.PARTIAL,
            size: 0,
            caseInsensitive: true,
        },
        tsCreation: {
            type: INDEX_TYPES.NUMERIC,
            precision: 24 * 3600 * 1000,
        },
    });
    constructor() {
        const storage = new TestStorage();
        storage.latency = 8;
        this.#collection.storage = storage;
    }

    init() {
        return this.#collection.init();
    }

    async postMessage(m: Message, date: Date) {
        const message: Message = {
            id: generateUID(),
            authorId: m.authorId,
            content: m.content,
            tsCreation: date.getTime(),
        };
        if (this.#collection.keys.includes(message.id)) {
            throw new ReferenceError(`this message id already exist ${message.id}`);
        }
        await this.#collection.save(message.id, message);
        return message;
    }

    deleteMessage(id: string) {
        return this.#collection.delete(id);
    }
}
