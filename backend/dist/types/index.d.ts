export interface User {
    UserID: string;
    Email: string;
    PasswordHash: string;
    Salt: string;
    FirstName: string;
    LastName: string;
    FullName: string;
    MobileNumber?: string;
    DateOfBirth?: Date;
    AgeGroup: 'Child' | 'Youth' | 'Adult';
    Gender?: 'Male' | 'Female' | 'Other';
    PreferredLanguage: 'English' | 'Hindi';
    Role: 'Admin' | 'User';
    IsActive: boolean;
    IsEmailVerified: boolean;
    EmailVerificationToken?: string;
    PasswordResetToken?: string;
    PasswordResetExpiry?: Date;
    LastLoginDate?: Date;
    ProfileImageURL?: string;
    City?: string;
    State?: string;
    Country: string;
    CreatedDate: Date;
    UpdatedDate: Date;
    CreatedBy?: string;
    UpdatedBy?: string;
}
export interface UserSession {
    SessionID: string;
    UserID: string;
    SessionToken: string;
    RefreshToken?: string;
    IPAddress?: string;
    UserAgent?: string;
    IsActive: boolean;
    ExpiresAt: Date;
    CreatedDate: Date;
    LastAccessedDate: Date;
}
export interface Competition {
    CompetitionID: string;
    Title: string;
    TitleHindi?: string;
    Description: string;
    DescriptionHindi?: string;
    BannerImageURL?: string;
    StartDate: Date;
    EndDate: Date;
    RegistrationStartDate?: Date;
    RegistrationEndDate?: Date;
    HasTimeLimit: boolean;
    TimeLimitMinutes?: number;
    MaxParticipants?: number;
    QuestionsPerPage: 1 | 5 | 10 | 20;
    AllowedQuestionTypes: string;
    DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
    Status: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
    IsActive: boolean;
    TotalQuestions?: number;
    CreatedDate: Date;
    UpdatedDate: Date;
    CreatedBy: string;
    UpdatedBy?: string;
}
export interface Question {
    QuestionID: string;
    CompetitionID: string;
    QuestionText: string;
    QuestionTextHindi?: string;
    QuestionType: 'MCQ' | 'Descriptive';
    QuestionImageURL?: string;
    Points: number;
    TimeLimitSeconds?: number;
    DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
    OrderIndex: number;
    IsActive: boolean;
    Explanation?: string;
    ExplanationHindi?: string;
    CreatedDate: Date;
    UpdatedDate: Date;
    CreatedBy: string;
    UpdatedBy?: string;
}
export interface QuestionOption {
    OptionID: string;
    QuestionID: string;
    OptionText: string;
    OptionTextHindi?: string;
    OptionImageURL?: string;
    IsCorrect: boolean;
    OrderIndex: number;
    CreatedDate: Date;
}
export interface UserCompetition {
    UserCompetitionID: string;
    UserID: string;
    CompetitionID: string;
    RegistrationDate: Date;
    Status: 'Registered' | 'Started' | 'Completed' | 'Disqualified';
    IsActive: boolean;
}
export interface QuizAttempt {
    AttemptID: string;
    UserID: string;
    CompetitionID: string;
    StartTime: Date;
    EndTime?: Date;
    SubmittedTime?: Date;
    Status: 'InProgress' | 'Completed' | 'Submitted' | 'TimedOut' | 'Abandoned';
    TotalScore: number;
    MaxPossibleScore?: number;
    PercentageScore?: number;
    TotalQuestions: number;
    AnsweredQuestions: number;
    CorrectAnswers: number;
    TimeSpentMinutes?: number;
    CurrentQuestionIndex: number;
    IPAddress?: string;
    UserAgent?: string;
    IsActive: boolean;
}
export interface UserAnswer {
    AnswerID: string;
    AttemptID: string;
    QuestionID: string;
    SelectedOptionID?: string;
    DescriptiveAnswer?: string;
    IsCorrect?: boolean;
    PointsEarned: number;
    TimeSpentSeconds?: number;
    AnsweredAt: Date;
    IsMarkedForReview: boolean;
}
export interface CompetitionResult {
    ResultID: string;
    CompetitionID: string;
    UserID: string;
    AttemptID: string;
    FinalScore: number;
    MaxPossibleScore: number;
    PercentageScore: number;
    Rank?: number;
    TotalParticipants?: number;
    CompletionTime?: Date;
    TimeSpentMinutes?: number;
    CorrectAnswers?: number;
    TotalQuestions?: number;
    Certificate?: string;
    IsPublished: boolean;
    CreatedDate: Date;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber?: string;
    dateOfBirth?: string;
    ageGroup: 'Child' | 'Youth' | 'Adult';
    gender?: 'Male' | 'Female' | 'Other';
    preferredLanguage?: 'English' | 'Hindi';
    city?: string;
    state?: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: any;
    token?: string;
    refreshToken?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string>;
}
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: 'Admin' | 'User';
    iat?: number;
    exp?: number;
}
export interface FileUpload {
    FileID: string;
    FileName: string;
    OriginalFileName: string;
    FileSize: number;
    MimeType: string;
    FileURL: string;
    EntityType?: string;
    EntityID?: string;
    UploadedBy: string;
    IsActive: boolean;
    CreatedDate: Date;
}
//# sourceMappingURL=index.d.ts.map