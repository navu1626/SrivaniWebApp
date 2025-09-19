import { Request, Response } from 'express';
declare class QuizController {
    startQuiz(req: Request, res: Response): Promise<void>;
    getOngoingForUser(req: Request, res: Response): Promise<void>;
    getAttempt(req: Request, res: Response): Promise<void>;
    getAttemptQuestionsApi(req: Request, res: Response): Promise<void>;
    saveProgress(req: Request, res: Response): Promise<void>;
    submitAttempt(req: Request, res: Response): Promise<void>;
    getCompletedForUser(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getQuizAttempt(req: Request, res: Response): Promise<void>;
    getQuizQuestions(req: Request, res: Response): Promise<void>;
    submitAnswer(req: Request, res: Response): Promise<void>;
    submitQuiz(req: Request, res: Response): Promise<void>;
    getAttemptResult(req: Request, res: Response): Promise<void>;
    getQuizResults(req: Request, res: Response): Promise<void>;
    getQuizHistory(req: Request, res: Response): Promise<void>;
    resumeQuiz(req: Request, res: Response): Promise<void>;
}
export declare const quizController: QuizController;
export {};
//# sourceMappingURL=quizController.d.ts.map