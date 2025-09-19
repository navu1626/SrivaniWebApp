export type QuizAttemptStatus = 'InProgress' | 'Completed' | 'Submitted' | 'TimedOut';
export declare class QuizService {
    startQuiz(userId: string, competitionId: string): Promise<{
        attemptId: string;
    }>;
    getOngoingAttempts(userId: string): Promise<any>;
    getCompletedAttempts(userId: string): Promise<any>;
    getUserDashboardStats(userId: string): Promise<any>;
    getAttempt(attemptId: string): Promise<any>;
    getAttemptQuestions(attemptId: string): Promise<any>;
    saveProgress(attemptId: string, payload: {
        currentIndex?: number;
        remainingSeconds?: number;
        answers?: Array<{
            questionId: string;
            selectedOptionIndex?: number;
            answerText?: string;
        }>;
    }): Promise<void>;
    submitAttempt(attemptId: string): Promise<{
        correct: number;
    }>;
    getActiveCompetitionsForUser(userId: string): Promise<any>;
    getAttemptResultSummary(userId: string, attemptId: string): Promise<any>;
    getUpcomingCompetitionsForUser(userId: string): Promise<any>;
}
export declare const quizService: QuizService;
//# sourceMappingURL=quizService.d.ts.map