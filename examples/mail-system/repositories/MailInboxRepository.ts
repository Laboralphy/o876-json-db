import { Collection } from '../../../src/Collection';
import { INDEX_TYPES } from '../../../src/enums';
import { MailMessage } from '../entities/MailMessage';
import { MailInbox } from '../entities/MailInbox';
import { TestStorage } from '../../../src/storage-adapters/TestStorage';
import { Cursor } from '../../../src/Cursor';

export class MailInboxRepository {
    #collection: Collection<MailInbox> = new Collection('mail-inboxes', {
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
        if (minValue > aSortedValues[aSortedValues.length - 1]) {
            return minValue;
        }
        let nExpectedValue = minValue;
        for (let i = 0, l = aSortedValues.length; i < l; ++i) {
            if (aSortedValues[i] > nExpectedValue) {
                return nExpectedValue;
            }
            ++nExpectedValue;
        }
        return nExpectedValue;
    }

    /**
     * Checks all messages in inbox, tags all untagged messages (and updates them), sorts messages
     * @param userId
     * @return all inbox message, tagged & sorted
     */
    async checkInbox(userId: string) {
        // get all users inbox entries
        const aInboxCursor = await this.#collection.find({ userId, deleted: false });
        const aInbox = await aInboxCursor.fetchAll();
        if (aInbox.some((b) => b.deleted)) {
            throw new Error('should not have deleted message');
        }
        // get the maximum value of tag
        const aTags = aInbox.map((mib) => mib.tag);
        // Filter all untagged (0) inbox entries
        const aUntagged = aInbox.filter((mib) => mib.tag == 0);
        // Tags all untagged inbox entries with auto incremental tag
        for (const m of aUntagged) {
            const mibId = this.getKey(userId, m.messageId);
            m.tag = this.getMinimalMissingValue(aTags, 1);
            aTags.push(m.tag);
            // save those newly tagged inbox entries
            await this.#collection.save(mibId, m);
        }
        return aInbox.sort((a, b) => {
            if (a.kept == b.kept) {
                return b.tsReceived - a.tsReceived;
            } else {
                return a.kept ? -1 : 1;
            }
        });
    }

    /**
     * A message is placed in the user's inbox
     */
    receiveMessage(userId: string, messageId: string, timestamp: number) {
        const entry: MailInbox = {
            userId,
            tag: 0,
            messageId,
            tsReceived: timestamp,
            deleted: false,
            kept: false,
            read: false,
        };
        return this.#collection.save(this.getKey(userId, messageId), entry);
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
            if (purge) {
                return this.#collection.delete(mibId);
            } else {
                return this.#collection.save(mibId, {
                    ...mib,
                    deleted: true,
                    kept: false,
                });
            }
        } else {
            throw new ReferenceError(`Inbox entry ${mibId} does not exist`);
        }
    }

    /**
     * Marks a message as read
     * @param userId
     * @param messageId
     */
    async readMessage(userId: string, messageId: string): Promise<MailInbox> {
        const mibId = this.getKey(userId, messageId);
        const mib = await this.#collection.load(mibId);
        if (mib) {
            await this.#collection.save(mibId, {
                ...mib,
                read: true,
            });
            return mib;
        } else {
            throw new ReferenceError(`message ${messageId}, not found in user ${userId} inbox`);
        }
    }

    async retagInbox(userId: string): Promise<void> {
        const mib = await this.#collection.find({ userId });
        const tags = new Set<number>();
        const retagThese = new Map<string, MailInbox>();
        for (const mibId of mib.keys) {
            const mib = await this.#collection.load(mibId);
            if (mib) {
                if (mib.tag === undefined || tags.has(mib.tag)) {
                    retagThese.set(mibId, mib);
                }
            }
        }
        // retag all non unique tags
        const aTags = Array.from(tags);
        const aSaves: Promise<void>[] = [];
        for (const [mibId, mib] of retagThese.entries()) {
            aSaves.push(
                this.#collection.save(mibId, {
                    ...mib,
                    tag: this.getMinimalMissingValue(aTags),
                })
            );
        }
        await Promise.all(aSaves);
    }

    /**
     * Return the message identified by the specified tag.
     * @param userId user identifier
     * @param tag message tag
     */
    async getMessageByTag(userId: string, tag: string): Promise<MailInbox | undefined> {
        const mib = await this.#collection.find({ userId, tag });
        if (mib.count == 1) {
            return mib.first();
        } else if (mib.count > 1) {
            // more than one message share the same tag
            // this is an anomaly
            // we will try to retag these messages
            // first get all message inbox id
        } else {
            return undefined;
        }
    }
}
