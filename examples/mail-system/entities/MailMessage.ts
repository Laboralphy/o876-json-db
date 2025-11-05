export type MailMessage = {
    id: string;
    senderId: string;
    recipientIds: string[];
    content: string;
    tsCreation: number;
};
