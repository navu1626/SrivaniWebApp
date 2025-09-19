import { Request, Response } from 'express';
declare class CompetitionController {
    getAllCompetitions(req: Request, res: Response): Promise<void>;
    getCompetitionById(req: Request, res: Response): Promise<void>;
    createCompetition(req: Request, res: Response): Promise<void>;
    updateCompetition(req: Request, res: Response): Promise<void>;
    deleteCompetition(req: Request, res: Response): Promise<void>;
    publishCompetition(req: Request, res: Response): Promise<void>;
    declareResult(req: Request, res: Response): Promise<void>;
    getActiveForUser(req: Request, res: Response): Promise<void>;
    getUpcomingForUser(req: Request, res: Response): Promise<void>;
    copyCompetition(req: Request, res: Response): Promise<void>;
    registerForCompetition(req: Request, res: Response): Promise<void>;
    getUserCompetitions(req: Request, res: Response): Promise<void>;
    getCompetitionQuestions(req: Request, res: Response): Promise<void>;
}
export declare const competitionController: CompetitionController;
export {};
//# sourceMappingURL=competitionController.d.ts.map