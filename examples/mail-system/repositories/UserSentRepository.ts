import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { MemoryStorage } from '../../../src/storage-adapters/MemoryStorage';
import { generateUID } from '../libs/uid-generator';
import { Message } from '../entities/Message';
import { UserInbox } from '../entities/UserInbox';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';
import { UserSent } from '../entities/UserSent';

export class UserSentRepository {
    #collection: Collection = new Collection('user-sent', {
        userId: {
            type: INDEX_TYPES.PARTIAL,
            size: 0,
            caseInsensitive: true,
        },
        tsSent: {
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

    /**
     * A message is placed in the user's inbox
     */
    sendMessage(message: Message, recipientId: string, date: Date) {
        const entry: UserSent = {
            id: generateUID(),
            userId: message.authorId,
            messageId: message.id,
            tsSent: date.getTime(),
            recipientId,
        };
        if (this.#collection.keys.includes(entry.id)) {
            throw new ReferenceError(`this sent message id already exist ${entry.id}`);
        }
        return this.#collection.save(entry.id, entry);
    }

    /**
     * delete an item from the sent collection
     */
    async deleteSentMessage(sentId: string) {
        return this.#collection.delete(sentId);
    }

    async getSentMessages(userId: string) {
        const m = await this.#collection.find({ userId });
        const aMessages: UserSent[] = await m.fetchAll();
        return aMessages.sort((m1, m2) => m2.tsSent - m1.tsSent);
    }
}
