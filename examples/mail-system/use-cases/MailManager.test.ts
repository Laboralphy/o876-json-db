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

        await inboxRepository.receiveMessage('u3', m, 1762356958130);

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

        await inboxRepository.receiveMessage('u3', m, 1762356958130);
        await inboxRepository.receiveMessage('u4', m, 1762356958130);

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
            expect(mr.getMinimalMissingValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14])).toBe(1);
        });
    });
});

describe('readMessage', () => {
    it('should mark return', async () => {
        const mm = new MailManager({
            inboxRepository: new MailInboxRepository(),
            messageRepository: new MailMessageRepository(),
        });
        await mm.init();
        await mm.sendMessage('new message content', 'u1', ['u3', 'u4'], 1762356958130);
        const mib = await mm.checkUserInbox('u3');
        expect(mib.length).toBe(1);
        const msgId = mib[0].id;
        // const m = mm.readMessage('u3');
    });
});
