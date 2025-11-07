import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { MailMessage } from '../entities/MailMessage';
import { MailInbox } from '../entities/MailInbox';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';
import { Cursor } from '../../../src/Cursor';

export class MailInboxRepository {
    #collection: Collection = new Collection('mail-inboxes', {
        userId: {
            type: INDEX_TYPES.PARTIAL,
            size: 0,
            caseInsensitive: true,
        },
        tag: {
            type: INDEX_TYPES.NUMERIC,
            precision: 1,
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

    getKey(userId: string, messageId: string) {
        return userId + '-' + messageId;
    }

    init() {
        return this.#collection.init();
    }

    getMinimalMissingValue(aValues: number[], minValue = 1) {
        const aSortedValues = [
            ...new Set(aValues.filter((x) => Number.isInteger(x) && x >= minValue)),
        ].sort((a, b) => a - b);
        if (aSortedValues.length == 0) {
            return minValue;
        }
        let nExpectedValue = minValue;
        for (let i = 0, l = aSortedValues.length; i < l; ++i) {
            if (aSortedValues[i] > nExpectedValue) {
                return nExpectedValue;
            }
            ++nExpectedValue;
        }
    }

    /**
     * Checks all messages in inbox, tags all untagged messages (and updates them), sorts messages
     * @param userId
     * @return all inbox message, tagged & sorted
     */
    async checkInbox(userId: string) {
        // get all users inbox entries
        const aInboxCursor = await this.#collection.find<MailInbox>({ userId, deleted: false });
        const aInbox = await aInboxCursor.fetchAll();
        // get the maximum value of tag
        let nMaxTag = aInbox.reduce((acc, curr) => {
            return Math.max(acc, curr.tag);
        }, 0);
        // Filter all untagged (0) inbox entries
        const aUntagged = aInbox.filter((mib) => mib.tag == 0);
        // Tags all untagged inbox entries with auto incremental tag
        for (const m of aUntagged) {
            const mibId = this.getKey(userId, m.messageId);
            m.tag = ++nMaxTag;
            // save those newly tagged inbox entries
            await this.#collection.save(mibId, m);
        }
        return aInbox.sort((a, b) => {
            if (a.kept == b.kept) {
                return a.tsReceived - a.tsReceived;
            } else {
                return a.kept ? -1 : 1;
            }
        });
    }

    /**
     * A message is placed in the user's inbox
     */
    receiveMessage(userId: string, message: MailMessage, timestamp: number) {
        const entry: MailInbox = {
            userId,
            tag: 0,
            messageId: message.id,
            tsReceived: timestamp,
            deleted: false,
            kept: false,
            read: false,
        };
        return this.#collection.save(this.getKey(userId, entry.messageId), entry);
    }

    /**
     * Marks a message as deleted but do not remove it from collection yet
     * @param userId
     * @param messageId
     * @param purge remove physical this inbox entry (original message is gone)
     */
    async deleteMessage(userId: string, messageId: string, purge: boolean = false) {
        const mibId = this.getKey(userId, messageId);
        const mib: MailInbox | undefined = await this.#collection.load(mibId);
        if (mib) {
            mib.deleted = true;
            mib.kept = false;
            return this.#collection.save(mibId, mib);
        }
    }

    /**
     * Marks a message as read
     * @param userId
     * @param messageId
     */
    async readMessage(userId: string, messageId: string): Promise<MailInbox> {
        const mibId = this.getKey(userId, messageId);
        const mib: MailInbox | undefined = await this.#collection.load(mibId);
        if (mib) {
            mib.read = true;
            await this.#collection.save(mibId, mib);
            return mib;
        } else {
            throw new ReferenceError(`message ${messageId}, not found in user ${userId} inbox`);
        }
    }
}
