import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { generateUID } from '../libs/uid-generator';
import { MailMessage } from '../entities/MailMessage';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';

export class MailMessageRepository {
    #collection: Collection = new Collection('mail-messages', {
        senderId: {
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

    async getMessage(id: string): Promise<MailMessage | undefined> {
        return this.#collection.load(id);
    }

    async postMessage(
        senderId: string,
        recipientIds: string[],
        content: string,
        timestamp: number
    ) {
        const message: MailMessage = {
            id: generateUID(),
            senderId,
            recipientIds,
            content,
            tsCreation: timestamp,
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
