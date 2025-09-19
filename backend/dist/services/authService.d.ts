import { Request } from 'express';
import { User } from '@/types';
declare class AuthService {
    generateTokens(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    createSession(userId: string, accessToken: string, refreshToken: string, req: Request): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    invalidateSession(userId: string, accessToken: string): Promise<void>;
    generatePasswordResetToken(userId: string): Promise<string>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    generateEmailVerificationToken(userId: string): Promise<string>;
    verifyEmail(token: string): Promise<void>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map