import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { MemoryStorage } from '../../../src/storage-adapters/MemoryStorage';
import { generateUID } from '../libs/uid-generator';
import { Message } from '../entities/Message';
import { UserInbox } from '../entities/UserInbox';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';

export class UserInboxRepository {
    #collection: Collection = new Collection('user-inbox', {
        userId: {
            type: INDEX_TYPES.PARTIAL,
            size: 0,
            caseInsensitive: true,
        },
        tsReceived: {
            type: INDEX_TYPES.NUMERIC,
            precision: 24 * 3600 * 1000,
        },
        deleted: {
            type: INDEX_TYPES.BOOLEAN,
        },
        kept: {
            type: INDEX_TYPES.BOOLEAN,
        },
        read: {
            type: INDEX_TYPES.BOOLEAN,
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
    receiveMessage(message: Message, date: Date) {
        const entry: UserInbox = {
            id: generateUID(),
            userId: message.authorId,
            messageId: message.id,
            tsReceived: date.getTime(),
            deleted: false,
            kept: false,
            read: false,
        };
        return this.#collection.save(entry.id, entry);
    }

    /**
     * Marks a message as deleted but do not remove it from collection yet
     * @param messageId
     */
    async deleteMessage(messageId: string) {
        const message: UserInbox | undefined = await this.#collection.load(messageId);
        if (message) {
            message.deleted = true;
            message.kept = false;
            return this.#collection.save(message.id, message);
        }
    }

    /**
     * Marks a message as read
     * @param messageId
     */
    async readMessage(messageId: string) {
        const message: UserInbox | undefined = await this.#collection.load(messageId);
        if (message) {
            message.read = true;
            return this.#collection.save(message.id, message);
        }
    }

    async getInbox(userId: string) {
        const m = await this.#collection.find({ userId, deleted: false });
        const aMessages: UserInbox[] = await m.fetchAll();
        return aMessages.sort((m1, m2) => {
            if (m1.kept == m2.kept) {
                return m2.tsReceived - m1.tsReceived;
            } else {
                return (m1.kept ? 0 : 1) - (m2.kept ? 0 : 1);
            }
        });
    }
}
