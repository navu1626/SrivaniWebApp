export type CreateCompetitionPayload = {
    title: string;
    titleHi?: string;
    description: string;
    descriptionHi?: string;
    bannerImageUrl?: string;
    startDate: string;
    endDate: string;
    hasTimeLimit?: boolean;
    timeLimitMinutes?: number;
    maxParticipants?: number;
    questionsPerPage?: 1 | 5 | 10 | 20;
    allowedQuestionTypes?: string;
    difficultyLevel?: 'Easy' | 'Medium' | 'Hard';
    status?: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
    questions?: Array<{
        type: 'mcq' | 'descriptive';
        question: string;
        questionHi?: string;
        options?: string[];
        optionsHi?: string[];
        correctAnswer?: number;
        points?: number;
        timeLimit?: number;
        imageUrl?: string;
    }>;
};
declare class CompetitionService {
    copyCompetition(adminUserId: string, sourceCompetitionId: string): Promise<string>;
    createCompetition(adminUserId: string, payload: CreateCompetitionPayload): Promise<{
        competitionId: string;
    }>;
    getAllCompetitions(page: number, limit: number, status?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCompetitionById(competitionId: string): Promise<any>;
    updateCompetition(adminUserId: string, competitionId: string, data: any): Promise<any>;
    deleteCompetition(competitionId: string): Promise<void>;
    publishCompetition(adminUserId: string, competitionId: string): Promise<void>;
    declareResult(adminUserId: string, competitionId: string, when: Date): Promise<void>;
    getCompetitionQuestions(competitionId: string): Promise<any[]>;
}
export declare const competitionService: CompetitionService;
export {};
//# sourceMappingURL=competitionService.d.ts.map