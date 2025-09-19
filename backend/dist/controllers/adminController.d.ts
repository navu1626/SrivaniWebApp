import { Request, Response } from 'express';
declare class AdminController {
    getStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const adminController: AdminController;
export {};
//# sourceMappingURL=adminController.d.ts.map