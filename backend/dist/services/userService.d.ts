import { User, RegisterRequest } from '../types';
declare class UserService {
    findByEmail(email: string): Promise<User | null>;
    findById(userId: string): Promise<User | null>;
    createUser(userData: RegisterRequest): Promise<User>;
    updateProfile(userId: string, updateData: Partial<User>): Promise<User>;
    updateLastLogin(userId: string): Promise<void>;
    getUserStatistics(userId: string): Promise<any>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        users: Omit<User, 'PasswordHash' | 'Salt'>[];
        total: number;
        totalPages: number;
    }>;
    deactivateUser(userId: string): Promise<void>;
    activateUser(userId: string): Promise<void>;
    changeUserPassword(userId: string, newPassword: string): Promise<void>;
}
export declare const userService: UserService;
export {};
//# sourceMappingURL=userService.d.ts.map