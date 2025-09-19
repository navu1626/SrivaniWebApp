import { Request, Response } from 'express';
declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendVerification(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=authController.d.ts.map