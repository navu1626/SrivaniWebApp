export type NotificationRecipient = {
    UserID: string;
    FirstName: string;
    LastName: string;
    FullName?: string;
    MobileNumber?: string | null;
    Gender?: string | null;
    City?: string | null;
    State?: string | null;
    MessageSent?: number;
    SentDateTime?: Date | null;
};
declare class NotificationService {
    getPublishedCompetitions(): Promise<any[]>;
    getRecipientsWithStatus(competitionId: string): Promise<NotificationRecipient[]>;
    recordSent(competitionId: string, userId: string): Promise<void>;
    sendWhatsApp(mobile: string, message: string): Promise<{
        success: boolean;
        status: number;
        body?: any;
        error?: string;
    }>;
    sendNotifications(competitionId: string, userIds: string[], message: string): Promise<{
        total: number;
        sent: number;
        results: Array<{
            userId: string;
            success: boolean;
            status: number;
            error?: string;
        }>;
    }>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map