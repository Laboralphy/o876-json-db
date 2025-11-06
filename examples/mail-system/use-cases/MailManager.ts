import { MailMessageRepository } from '../repositories/MailMessageRepository';
import { MailInboxRepository } from '../repositories/MailInboxRepository';
import { MailInbox } from '../entities/MailInbox';
import { asyncWrapProviders } from 'node:async_hooks';

export type UserInboxResult = {
    tag: number;
    sender: string;
    message: string;
    date: number;
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
            toUserIds.map((userId) => this._inboxRepository.receiveMessage(userId, message, nNow))
        );
    }

    /**
     * Retrieve list of all message in a user's inbox, sorted by date, kept flag
     * @param userId
     */
    async checkUserInbox(userId: string) {
        const aInbox = await this._inboxRepository.checkInbox(userId);
    }

    /**
     * The specified user is reading the specified message
     * @param userId
     * @param messageId
     */
    async readMessage(userId: string, messageId: string) {}
}
