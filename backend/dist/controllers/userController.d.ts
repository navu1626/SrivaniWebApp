import { Request, Response } from 'express';
declare class UserController {
    getProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    getStatistics(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    updateUserById(req: Request, res: Response): Promise<void>;
    getUserStatistics(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
    activateUser(req: Request, res: Response): Promise<void>;
    deactivateUser(req: Request, res: Response): Promise<void>;
    exportUsers(req: Request, res: Response): Promise<void>;
    changeUserPassword(req: Request, res: Response): Promise<void>;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=userController.d.ts.map