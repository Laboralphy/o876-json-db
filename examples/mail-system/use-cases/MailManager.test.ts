import { MailManager } from './MailManager';
import { MailInboxRepository } from '../repositories/MailInboxRepository';
import { MailMessageRepository } from '../repositories/MailMessageRepository';

describe('checkUserInbox', () => {
    it('should return empty inbox when no message has ever been written', async () => {
        const mm = new MailManager({
            inboxRepository: new MailInboxRepository(),
            messageRepository: new MailMessageRepository(),
        });
        await mm.init();
        const mib = await mm.checkUserInbox('u1');
        expect(mib).toEqual([]);
    });
    it('should return inbox with one message when one message is written for one user', async () => {
        const inboxRepository = new MailInboxRepository();
        const messageRepository = new MailMessageRepository();
        const mm = new MailManager({
            inboxRepository,
            messageRepository,
        });
        await mm.init();

        const m = await messageRepository.postMessage(
            'u2',
            ['u3'],
            'content of the message',
            1762356958130
        );
        expect(m.senderId).toBe('u2');
        expect(m.content).toBe('content of the message');
        expect(m.tsCreation).toBe(1762356958130);
        expect(m.recipientIds.includes('u3')).toBe(true);

        await inboxRepository.receiveMessage('u3', m.id, 1762356958130);

        const mib = await mm.checkUserInbox('u3');
        expect(mib.length).toBe(1);
        expect(mib[0].tag).toBe(1);
        expect(mib[0].sender).toBe('u2');
        expect(mib[0].message).toBe('content of the message');
        expect(mib[0].kept).toBe(false);
        expect(mib[0].read).toBe(false);
        expect(mib[0].timestamp).toBe(1762356958130);
    });
    it('should return inbox with one message when one message is written for each user inbox of [u3, u4]', async () => {
        const inboxRepository = new MailInboxRepository();
        const messageRepository = new MailMessageRepository();
        const mm = new MailManager({
            inboxRepository,
            messageRepository,
        });
        await mm.init();

        const m = await messageRepository.postMessage(
            'u2',
            ['u3', 'u4'],
            'content of the message',
            1762356958130
        );
        expect(m.senderId).toBe('u2');
        expect(m.content).toBe('content of the message');
        expect(m.tsCreation).toBe(1762356958130);
        expect(m.recipientIds.includes('u3')).toBe(true);
        expect(m.recipientIds.includes('u4')).toBe(true);
        expect(m.recipientIds).toHaveLength(2);

        await inboxRepository.receiveMessage('u3', m.id, 1762356958130);
        await inboxRepository.receiveMessage('u4', m.id, 1762356958130);

        const mibu4 = await mm.checkUserInbox('u4');
        expect(mibu4.length).toBe(1);
        expect(mibu4[0].tag).toBe(1);
        expect(mibu4[0].sender).toBe('u2');
        expect(mibu4[0].message).toBe('content of the message');
        expect(mibu4[0].kept).toBe(false);
        expect(mibu4[0].read).toBe(false);
        expect(mibu4[0].timestamp).toBe(1762356958130);

        const mibu3 = await mm.checkUserInbox('u3');
        expect(mibu3.length).toBe(1);
        expect(mibu3[0].tag).toBe(1);
        expect(mibu3[0].sender).toBe('u2');
        expect(mibu3[0].message).toBe('content of the message');
        expect(mibu3[0].kept).toBe(false);
        expect(mibu3[0].read).toBe(false);
        expect(mibu3[0].timestamp).toBe(1762356958130);
    });
    it('should sort inbox message properly : kept message first then other messages', async () => {
        const inboxRepository = new MailInboxRepository();
        const messageRepository = new MailMessageRepository();
        const mm = new MailManager({
            inboxRepository,
            messageRepository,
        });
        await mm.init();
    });
});

describe('writeMessage', () => {
    it('should populate inbox with one message when writing message', async () => {
        const mm = new MailManager({
            inboxRepository: new MailInboxRepository(),
            messageRepository: new MailMessageRepository(),
        });
        await mm.init();
        await mm.sendMessage('new message content', 'u1', ['u3'], 1762356958130);
        const mibu3 = await mm.checkUserInbox('u3');
        expect(mibu3.length).toBe(1);
        expect(mibu3[0].tag).toBe(1);
        expect(mibu3[0].sender).toBe('u1');
        expect(mibu3[0].kept).toBe(false);
        expect(mibu3[0].read).toBe(false);
        expect(mibu3[0].timestamp).toBe(1762356958130);
        const mib = await mm.checkUserInbox('u1');
        expect(mib).toEqual([]);
    });
    it('should populate inbox with one message for each recipient user when writing message for u3 and u4', async () => {
        const mm = new MailManager({
            inboxRepository: new MailInboxRepository(),
            messageRepository: new MailMessageRepository(),
        });
        await mm.init();
        await mm.sendMessage('new message content', 'u1', ['u3', 'u4'], 1762356958130);
        const mibu3 = await mm.checkUserInbox('u3');
        expect(mibu3.length).toBe(1);
        expect(mibu3[0].tag).toBe(1);
        expect(mibu3[0].sender).toBe('u1');
        expect(mibu3[0].message).toBe('new message content');
        expect(mibu3[0].kept).toBe(false);
        expect(mibu3[0].read).toBe(false);
        expect(mibu3[0].timestamp).toBe(1762356958130);

        const mibu4 = await mm.checkUserInbox('u4');
        expect(mibu4.length).toBe(1);
        expect(mibu4[0].tag).toBe(1);
        expect(mibu4[0].sender).toBe('u1');
        expect(mibu4[0].kept).toBe(false);
        expect(mibu4[0].read).toBe(false);
        expect(mibu4[0].timestamp).toBe(1762356958130);
    });
});

describe('getMinimalMissingValue', () => {
    describe('when input is empty', () => {
        it('should return 1 when minValue is not specified', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([])).toBe(1);
        });
        it('should return 100 when input is [] and minValue is 100', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([], 100)).toBe(100);
        });
        it('should return -100 when minValue is -100', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([], -100)).toBe(-100);
        });
    });
    describe('when input is empty', () => {
        it('should return 1 when input is [2, 3, 4, 5]', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([2, 3, 4, 5])).toBe(1);
        });
        it('should return 10 when input is [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14])).toBe(10);
        });
        it('should return 10 when input is [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14] and minValue is 5', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14], 5)).toBe(
                10
            );
        });
        it('should return 10 when input is [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14] and minValue is 10', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14], 10)).toBe(
                10
            );
        });
        it('should return 15 when input is [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14] and minValue is 12', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14], 12)).toBe(
                15
            );
        });
        it('should return 20 when input is [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14] and minValue is 20', () => {
            const mr = new MailInboxRepository();
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14], 20)).toBe(
                20
            );
        });
    });
});

describe('readMessage', () => {
    it('should mark message as read', async () => {
        const mm = new MailManager({
            inboxRepository: new MailInboxRepository(),
            messageRepository: new MailMessageRepository(),
        });
        await mm.init();
        await mm.sendMessage('new message content', 'u1', ['u3', 'u4'], 1762356958130);
        const mib = await mm.checkUserInbox('u3');
        expect(mib.length).toBe(1);
        expect(mib[0].read).toBe(false);
        const msgId = mib[0].id;
        const m = await mm.readMessage('u3', msgId);
        expect(m).toMatchObject({
            senderId: 'u1',
            recipientIds: ['u3', 'u4'],
            content: 'new message content',
            tsCreation: 1762356958130,
        });
        // check if message is read
        const mib2 = await mm.checkUserInbox('u3');
        expect(mib2[0].read).toBe(true);
    });
});

describe('mailinboxRepository.retagInbox', () => {
    it('should not selected deleted inbox message', async () => {
        const mr = new MailInboxRepository();
        await mr.init();
        await mr.receiveMessage('u2', 'm1', 1000000);
        await mr.receiveMessage('u2', 'm2', 1000001);
        await mr.receiveMessage('u2', 'm3', 1000002);
        await mr.receiveMessage('u2', 'm4', 1000003);
        await mr.deleteMessage('u2', 'm2');
        const mib = await mr.checkInbox('u2');
        expect(mib.length).toBe(3);
    });
    it('delted message are not really deleted, they keep their tag, until they are purged', async () => {
        const mr = new MailInboxRepository();
        await mr.init();
        await mr.receiveMessage('u2', 'm1', 1000000);
        await mr.receiveMessage('u2', 'm2', 1000001);
        await mr.receiveMessage('u2', 'm3', 1000002);
        await mr.receiveMessage('u2', 'm4', 1000003);
        let mib = await mr.checkInbox('u2');
        expect(mib).toEqual([
            {
                userId: 'u2',
                tag: 4,
                messageId: 'm4',
                tsReceived: 1000003,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 3,
                messageId: 'm3',
                tsReceived: 1000002,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 2,
                messageId: 'm2',
                tsReceived: 1000001,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 1,
                messageId: 'm1',
                tsReceived: 1000000,
                deleted: false,
                kept: false,
                read: false,
            },
        ]);
        await mr.deleteMessage('u2', 'm2');
        mib = await mr.checkInbox('u2');
        expect(mib).toEqual([
            {
                userId: 'u2',
                tag: 4,
                messageId: 'm4',
                tsReceived: 1000003,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 3,
                messageId: 'm3',
                tsReceived: 1000002,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 1,
                messageId: 'm1',
                tsReceived: 1000000,
                deleted: false,
                kept: false,
                read: false,
            },
        ]);
        await mr.receiveMessage('u2', 'm5', 1000009);
        mib = await mr.checkInbox('u2');
        expect(mib).toEqual([
            {
                userId: 'u2',
                tag: 5,
                messageId: 'm5',
                tsReceived: 1000009,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 4,
                messageId: 'm4',
                tsReceived: 1000003,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 3,
                messageId: 'm3',
                tsReceived: 1000002,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 1,
                messageId: 'm1',
                tsReceived: 1000000,
                deleted: false,
                kept: false,
                read: false,
            },
        ]);
        await mr.deleteMessage('u2', 'm2', true);
        await mr.receiveMessage('u2', 'm6', 1000010);
        mib = await mr.checkInbox('u2');
        expect(mib).toEqual([
            {
                userId: 'u2',
                tag: 2,
                messageId: 'm6',
                tsReceived: 1000010,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 5,
                messageId: 'm5',
                tsReceived: 1000009,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 4,
                messageId: 'm4',
                tsReceived: 1000003,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 3,
                messageId: 'm3',
                tsReceived: 1000002,
                deleted: false,
                kept: false,
                read: false,
            },
            {
                userId: 'u2',
                tag: 1,
                messageId: 'm1',
                tsReceived: 1000000,
                deleted: false,
                kept: false,
                read: false,
            },
        ]);
    });
});
