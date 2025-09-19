import { Request, Response } from 'express';
import multer from 'multer';
export declare const questionImageUpload: multer.Multer;
declare class UploadController {
    uploadProfileImage(req: Request, res: Response): Promise<void>;
    uploadCompetitionBanner(req: Request, res: Response): Promise<void>;
    uploadQuestionsExcel(req: Request, res: Response): Promise<void>;
    getFile(req: Request, res: Response): Promise<void>;
    deleteFile(req: Request, res: Response): Promise<void>;
    uploadQuestionImage(req: Request, res: Response): Promise<void>;
    deleteQuestionImage(req: Request, res: Response): Promise<void>;
}
export declare const uploadController: UploadController;
export {};
//# sourceMappingURL=uploadController.d.ts.map