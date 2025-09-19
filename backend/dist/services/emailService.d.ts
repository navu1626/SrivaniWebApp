import { User } from '@/types';
declare class EmailService {
    private transporter;
    constructor();
    sendSupportEmail(fromName: string, fromEmail: string, subject: string, message: string): Promise<void>;
    sendVerificationEmail(user: User): Promise<void>;
    sendPasswordChangedNotification(user: User, newPassword: string): Promise<void>;
    sendPasswordResetEmail(user: User, resetToken: string): Promise<void>;
    sendWelcomeEmail(user: User): Promise<void>;
    private getVerificationEmailTemplate;
    private getPasswordResetEmailTemplate;
    private getWelcomeEmailTemplate;
    private getPasswordChangedTemplate;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map