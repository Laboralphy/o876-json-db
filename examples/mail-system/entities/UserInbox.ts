export type UserInbox = {
    id: string;
    userId: string;
    messageId: string;
    tsReceived: number;
    deleted: boolean;
    kept: boolean;
    read: boolean;
};
