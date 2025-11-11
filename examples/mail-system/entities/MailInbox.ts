export type MailInbox = {
    messageId: string;
    tag: number;
    userId: string;
    tsReceived: number;
    deleted: boolean;
    kept: boolean;
    read: boolean;
};
