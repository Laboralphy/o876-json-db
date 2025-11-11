import { MailMessageRepository } from '../repositories/MailMessageRepository';
import { MailInboxRepository } from '../repositories/MailInboxRepository';

export type UserInboxResult = {
    id: string;
    tag: number;
    sender: string;
    message: string;
    timestamp: number;
    read: boolean;
    kept: boolean;
};

export class MailManager {
    private _messageRepository: MailMessageRepository;
    private _inboxRepository: MailInboxRepository;

    constructor({
        messageRepository,
        inboxRepository,
    }: {
        messageRepository: MailMessageRepository;
        inboxRepository: MailInboxRepository;
    }) {
        this._messageRepository = messageRepository;
        this._inboxRepository = inboxRepository;
    }

    init() {
        return Promise.all([this._inboxRepository.init(), this._messageRepository.init()]);
    }

    /**
     * Writes a new message and sends it to one or more users
     * @param content message content
     * @param fromUserId sender id
     * @param toUserIds recipient id list
     * @param nNow current timestamp
     */
    async sendMessage(content: string, fromUserId: string, toUserIds: string[], nNow: number) {
        // send message to MailMessage collection
        const message = await this._messageRepository.postMessage(
            fromUserId,
            toUserIds,
            content,
            nNow
        );
        return Promise.all(
            toUserIds.map((userId) =>
                this._inboxRepository.receiveMessage(userId, message.id, nNow)
            )
        );
    }

    /**
     * Retrieve list of all message in a user's inbox, sorted by date, kept flag
     * @param userId
     */
    async checkUserInbox(userId: string) {
        const aInbox = await this._inboxRepository.checkInbox(userId);
        const result: UserInboxResult[] = [];
        for (const mib of aInbox) {
            const message = await this._messageRepository.getMessage(mib.messageId);
            if (message) {
                result.push({
                    id: mib.messageId,
                    tag: mib.tag,
                    sender: message.senderId,
                    timestamp: message.tsCreation,
                    message: message.content.substring(0, 64),
                    kept: mib.kept,
                    read: mib.read,
                });
            } else {
                // could not find message, may be archived
                // get rid of inbox entry
                await this._inboxRepository.deleteMessage(mib.userId, mib.messageId, true);
            }
        }
        return result;
    }

    /**
     * The specified user is reading the specified message.
     * this will mark the message as read and return the content
     * if the corresponding message has been archive, the readMessage function erase the entry in inbox
     * @param userId
     * @param messageId
     */
    async readMessage(userId: string, messageId: string) {
        const mib = await this._inboxRepository.readMessage(userId, messageId);
        const message = await this._messageRepository.getMessage(mib.messageId);
        if (message) {
            return message;
        } else {
            // The message could not be found (maybe archived)
            // remove mail inbox entry
            await this._inboxRepository.deleteMessage(userId, messageId, true);
            return undefined;
        }
    }
}
