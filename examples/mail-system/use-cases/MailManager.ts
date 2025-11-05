import { MailMessageRepository } from '../repositories/MailMessageRepository';
import { MailInboxRepository } from '../repositories/MailInboxRepository';

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
     * Writes a new message for one or more users
     * @param content message content
     * @param fromUserId sender id
     * @param toUserIds recipient id list
     * @param nNow current timestamp
     */
    async writeMessage(content: string, fromUserId: string, toUserIds: string[], nNow: number) {
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
        return this._inboxRepository.checkInbox(userId);
    }
}
