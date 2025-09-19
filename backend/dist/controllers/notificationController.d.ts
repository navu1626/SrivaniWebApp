import { Request, Response } from 'express';
declare class NotificationController {
    getPublishedCompetitions: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getRecipients: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    send: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
export declare const notificationController: NotificationController;
export {};
//# sourceMappingURL=notificationController.d.ts.map