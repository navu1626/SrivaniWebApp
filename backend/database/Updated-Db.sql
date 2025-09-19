USE [SrivaniQuizDB]
GO
/****** Object:  Table [dbo].[CompetitionResults]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompetitionResults](
	[ResultID] [uniqueidentifier] NOT NULL,
	[CompetitionID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[AttemptID] [uniqueidentifier] NOT NULL,
	[FinalScore] [decimal](10, 2) NOT NULL,
	[MaxPossibleScore] [decimal](10, 2) NOT NULL,
	[PercentageScore]  AS (([FinalScore]/[MaxPossibleScore])*(100)) PERSISTED,
	[Rank] [int] NULL,
	[TotalParticipants] [int] NULL,
	[CompletionTime] [datetime2](7) NULL,
	[TimeSpentMinutes] [int] NULL,
	[CorrectAnswers] [int] NULL,
	[TotalQuestions] [int] NULL,
	[Certificate] [nvarchar](500) NULL,
	[IsPublished] [bit] NULL,
	[CreatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[ResultID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_CompetitionResults] UNIQUE NONCLUSTERED 
(
	[CompetitionID] ASC,
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Competitions]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Competitions](
	[CompetitionID] [uniqueidentifier] NOT NULL,
	[Title] [nvarchar](200) NOT NULL,
	[TitleHindi] [nvarchar](200) NULL,
	[Description] [nvarchar](max) NULL,
	[DescriptionHindi] [nvarchar](max) NULL,
	[BannerImageURL] [nvarchar](500) NULL,
	[StartDate] [datetime2](7) NOT NULL,
	[EndDate] [datetime2](7) NOT NULL,
	[RegistrationStartDate] [datetime2](7) NULL,
	[RegistrationEndDate] [datetime2](7) NULL,
	[HasTimeLimit] [bit] NULL,
	[TimeLimitMinutes] [int] NULL,
	[MaxParticipants] [int] NULL,
	[QuestionsPerPage] [int] NULL,
	[AllowedQuestionTypes] [nvarchar](50) NULL,
	[DifficultyLevel] [nvarchar](20) NULL,
	[Status] [nvarchar](20) NULL,
	[IsActive] [bit] NULL,
	[CreatedDate] [datetime2](7) NULL,
	[UpdatedDate] [datetime2](7) NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[UpdatedBy] [uniqueidentifier] NULL,
	[ResultAnnounceDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[CompetitionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuizAttempts]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuizAttempts](
	[AttemptID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[CompetitionID] [uniqueidentifier] NOT NULL,
	[Status] [nvarchar](20) NULL,
	[StartTime] [datetime2](7) NULL,
	[EndTime] [datetime2](7) NULL,
	[RemainingSeconds] [int] NULL,
	[CurrentQuestionIndex] [int] NULL,
	[TotalQuestions] [int] NULL,
	[CorrectAnswers] [int] NULL,
	[UpdatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[AttemptID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Questions]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Questions](
	[QuestionID] [uniqueidentifier] NOT NULL,
	[CompetitionID] [uniqueidentifier] NOT NULL,
	[QuestionText] [nvarchar](2000) NOT NULL,
	[QuestionTextHindi] [nvarchar](2000) NULL,
	[QuestionType] [nvarchar](20) NOT NULL,
	[QuestionImageURL] [nvarchar](500) NULL,
	[Points] [int] NULL,
	[TimeLimitSeconds] [int] NULL,
	[DifficultyLevel] [nvarchar](20) NULL,
	[OrderIndex] [int] NOT NULL,
	[IsActive] [bit] NULL,
	[Explanation] [nvarchar](1000) NULL,
	[ExplanationHindi] [nvarchar](1000) NULL,
	[CreatedDate] [datetime2](7) NULL,
	[UpdatedDate] [datetime2](7) NULL,
	[CreatedBy] [uniqueidentifier] NOT NULL,
	[UpdatedBy] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserCompetitions]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserCompetitions](
	[UserCompetitionID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[CompetitionID] [uniqueidentifier] NOT NULL,
	[RegistrationDate] [datetime2](7) NULL,
	[Status] [nvarchar](20) NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserCompetitionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_UserCompetitions] UNIQUE NONCLUSTERED 
(
	[UserID] ASC,
	[CompetitionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_CompetitionSummary]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_CompetitionSummary] AS
SELECT 
    c.CompetitionID,
    c.Title,
    c.TitleHindi,
    c.StartDate,
    c.EndDate,
    c.Status,
    c.DifficultyLevel,
    COUNT(DISTINCT q.QuestionID) as TotalQuestions,
    COUNT(DISTINCT uc.UserID) as TotalRegistrations,
    COUNT(DISTINCT qa.UserID) as TotalParticipants,
    COUNT(DISTINCT CASE WHEN qa.Status = 'Completed' THEN qa.UserID END) as CompletedParticipants,
    AVG(CASE WHEN cr.PercentageScore IS NOT NULL THEN cr.PercentageScore END) as AverageScore,
    MAX(cr.PercentageScore) as HighestScore
FROM Competitions c
LEFT JOIN Questions q ON c.CompetitionID = q.CompetitionID AND q.IsActive = 1
LEFT JOIN UserCompetitions uc ON c.CompetitionID = uc.CompetitionID AND uc.IsActive = 1
LEFT JOIN QuizAttempts qa ON c.CompetitionID = qa.CompetitionID
LEFT JOIN CompetitionResults cr ON c.CompetitionID = cr.CompetitionID
WHERE c.IsActive = 1
GROUP BY c.CompetitionID, c.Title, c.TitleHindi, c.StartDate, c.EndDate, c.Status, c.DifficultyLevel;
GO
/****** Object:  Table [dbo].[Users]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [uniqueidentifier] NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[Salt] [nvarchar](255) NOT NULL,
	[FirstName] [nvarchar](100) NOT NULL,
	[LastName] [nvarchar](100) NOT NULL,
	[FullName]  AS (([FirstName]+' ')+[LastName]) PERSISTED NOT NULL,
	[MobileNumber] [nvarchar](20) NULL,
	[DateOfBirth] [date] NULL,
	[AgeGroup] [nvarchar](20) NOT NULL,
	[Gender] [nvarchar](10) NULL,
	[PreferredLanguage] [nvarchar](10) NULL,
	[Role] [nvarchar](20) NULL,
	[IsActive] [bit] NULL,
	[IsEmailVerified] [bit] NULL,
	[EmailVerificationToken] [nvarchar](255) NULL,
	[PasswordResetToken] [nvarchar](255) NULL,
	[PasswordResetExpiry] [datetime2](7) NULL,
	[LastLoginDate] [datetime2](7) NULL,
	[ProfileImageURL] [nvarchar](500) NULL,
	[City] [nvarchar](100) NULL,
	[State] [nvarchar](100) NULL,
	[Country] [nvarchar](100) NULL,
	[CreatedDate] [datetime2](7) NULL,
	[UpdatedDate] [datetime2](7) NULL,
	[CreatedBy] [uniqueidentifier] NULL,
	[UpdatedBy] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_UserPerformance]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_UserPerformance] AS
SELECT 
    u.UserID,
    u.FullName,
    u.Email,
    u.AgeGroup,
    COUNT(DISTINCT uc.CompetitionID) as TotalRegistrations,
    COUNT(DISTINCT qa.CompetitionID) as TotalAttempts,
    COUNT(DISTINCT CASE WHEN qa.Status = 'Completed' THEN qa.CompetitionID END) as CompletedQuizzes,
    AVG(CASE WHEN cr.PercentageScore IS NOT NULL THEN cr.PercentageScore END) as AverageScore,
    MAX(cr.PercentageScore) as BestScore,
    SUM(cr.FinalScore) as TotalPointsEarned,
    AVG(qa.TimeSpentMinutes) as AverageTimeSpent
FROM Users u
LEFT JOIN UserCompetitions uc ON u.UserID = uc.UserID AND uc.IsActive = 1
LEFT JOIN QuizAttempts qa ON u.UserID = qa.UserID
LEFT JOIN CompetitionResults cr ON u.UserID = cr.UserID
WHERE u.IsActive = 1 AND u.Role = 'User'
GROUP BY u.UserID, u.FullName, u.Email, u.AgeGroup;
GO
/****** Object:  View [dbo].[vw_UsageAnalytics]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_UsageAnalytics] AS
SELECT 
    CAST(qa.StartTime AS DATE) as QuizDate,
    COUNT(DISTINCT qa.UserID) as UniqueUsers,
    COUNT(*) as TotalQuizzes,
    COUNT(CASE WHEN qa.Status = 'Completed' THEN 1 END) as CompletedQuizzes,
    AVG(qa.PercentageScore) as AverageScore,
    AVG(qa.TimeSpentMinutes) as AverageTimeSpent
FROM QuizAttempts qa
WHERE qa.StartTime >= DATEADD(DAY, -30, GETUTCDATE())
GROUP BY CAST(qa.StartTime AS DATE);
GO
/****** Object:  Table [dbo].[FileUploads]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FileUploads](
	[FileID] [uniqueidentifier] NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[OriginalFileName] [nvarchar](255) NOT NULL,
	[FileSize] [bigint] NOT NULL,
	[MimeType] [nvarchar](100) NOT NULL,
	[FileURL] [nvarchar](500) NOT NULL,
	[EntityType] [nvarchar](50) NULL,
	[EntityID] [uniqueidentifier] NULL,
	[UploadedBy] [uniqueidentifier] NOT NULL,
	[IsActive] [bit] NULL,
	[CreatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[FileID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuestionOptions]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuestionOptions](
	[OptionID] [uniqueidentifier] NOT NULL,
	[QuestionID] [uniqueidentifier] NOT NULL,
	[OptionText] [nvarchar](500) NOT NULL,
	[OptionTextHindi] [nvarchar](500) NULL,
	[OptionImageURL] [nvarchar](500) NULL,
	[IsCorrect] [bit] NULL,
	[OrderIndex] [int] NOT NULL,
	[CreatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[OptionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuizAttemptAnswers]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuizAttemptAnswers](
	[AttemptID] [uniqueidentifier] NOT NULL,
	[QuestionID] [uniqueidentifier] NOT NULL,
	[SelectedOptionIndex] [int] NULL,
	[AnswerText] [nvarchar](max) NULL,
	[AnsweredAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[AttemptID] ASC,
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SystemLogs]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SystemLogs](
	[LogID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NULL,
	[Action] [nvarchar](100) NOT NULL,
	[EntityType] [nvarchar](50) NULL,
	[EntityID] [uniqueidentifier] NULL,
	[Details] [nvarchar](max) NULL,
	[IPAddress] [nvarchar](45) NULL,
	[UserAgent] [nvarchar](500) NULL,
	[LogLevel] [nvarchar](20) NULL,
	[CreatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[LogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserAnswers]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserAnswers](
	[AnswerID] [uniqueidentifier] NOT NULL,
	[AttemptID] [uniqueidentifier] NOT NULL,
	[QuestionID] [uniqueidentifier] NOT NULL,
	[SelectedOptionID] [uniqueidentifier] NULL,
	[DescriptiveAnswer] [nvarchar](max) NULL,
	[IsCorrect] [bit] NULL,
	[PointsEarned] [decimal](10, 2) NULL,
	[TimeSpentSeconds] [int] NULL,
	[AnsweredAt] [datetime2](7) NULL,
	[IsMarkedForReview] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[AnswerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_UserAnswers] UNIQUE NONCLUSTERED 
(
	[AttemptID] ASC,
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSessions]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSessions](
	[SessionID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[SessionToken] [nvarchar](2000) NULL,
	[RefreshToken] [nvarchar](2000) NULL,
	[IPAddress] [nvarchar](45) NULL,
	[UserAgent] [nvarchar](500) NULL,
	[IsActive] [bit] NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[CreatedDate] [datetime2](7) NULL,
	[LastAccessedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[SessionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[SessionToken] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserStatistics]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserStatistics](
	[StatID] [uniqueidentifier] NOT NULL,
	[UserID] [uniqueidentifier] NOT NULL,
	[TotalCompetitionsParticipated] [int] NULL,
	[TotalCompetitionsCompleted] [int] NULL,
	[AverageScore] [decimal](5, 2) NULL,
	[BestScore] [decimal](5, 2) NULL,
	[TotalPointsEarned] [decimal](10, 2) NULL,
	[CurrentStreak] [int] NULL,
	[LongestStreak] [int] NULL,
	[TotalTimeSpentMinutes] [int] NULL,
	[FavoriteCategory] [nvarchar](100) NULL,
	[LastActivityDate] [datetime2](7) NULL,
	[Level] [nvarchar](50) NULL,
	[Badges] [nvarchar](max) NULL,
	[UpdatedDate] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[StatID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_UserStatistics_User] UNIQUE NONCLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[CompetitionResults] ADD  DEFAULT (newid()) FOR [ResultID]
GO
ALTER TABLE [dbo].[CompetitionResults] ADD  DEFAULT ((0)) FOR [IsPublished]
GO
ALTER TABLE [dbo].[CompetitionResults] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT (newid()) FOR [CompetitionID]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ((0)) FOR [HasTimeLimit]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ((1)) FOR [QuestionsPerPage]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ('MCQ,Descriptive') FOR [AllowedQuestionTypes]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ('Medium') FOR [DifficultyLevel]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ('Draft') FOR [Status]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Competitions] ADD  DEFAULT (getutcdate()) FOR [UpdatedDate]
GO
ALTER TABLE [dbo].[FileUploads] ADD  DEFAULT (newid()) FOR [FileID]
GO
ALTER TABLE [dbo].[FileUploads] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[FileUploads] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[QuestionOptions] ADD  DEFAULT (newid()) FOR [OptionID]
GO
ALTER TABLE [dbo].[QuestionOptions] ADD  DEFAULT ((0)) FOR [IsCorrect]
GO
ALTER TABLE [dbo].[QuestionOptions] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT (newid()) FOR [QuestionID]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT ((1)) FOR [Points]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT ('Medium') FOR [DifficultyLevel]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Questions] ADD  DEFAULT (getutcdate()) FOR [UpdatedDate]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT (newid()) FOR [AttemptID]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT ('InProgress') FOR [Status]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT (getutcdate()) FOR [StartTime]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT ((0)) FOR [CurrentQuestionIndex]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT ((0)) FOR [TotalQuestions]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT ((0)) FOR [CorrectAnswers]
GO
ALTER TABLE [dbo].[QuizAttempts] ADD  DEFAULT (getutcdate()) FOR [UpdatedDate]
GO
ALTER TABLE [dbo].[SystemLogs] ADD  DEFAULT (newid()) FOR [LogID]
GO
ALTER TABLE [dbo].[SystemLogs] ADD  DEFAULT ('Info') FOR [LogLevel]
GO
ALTER TABLE [dbo].[SystemLogs] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[UserAnswers] ADD  DEFAULT (newid()) FOR [AnswerID]
GO
ALTER TABLE [dbo].[UserAnswers] ADD  DEFAULT ((0)) FOR [PointsEarned]
GO
ALTER TABLE [dbo].[UserAnswers] ADD  DEFAULT (getutcdate()) FOR [AnsweredAt]
GO
ALTER TABLE [dbo].[UserAnswers] ADD  DEFAULT ((0)) FOR [IsMarkedForReview]
GO
ALTER TABLE [dbo].[UserCompetitions] ADD  DEFAULT (newid()) FOR [UserCompetitionID]
GO
ALTER TABLE [dbo].[UserCompetitions] ADD  DEFAULT (getutcdate()) FOR [RegistrationDate]
GO
ALTER TABLE [dbo].[UserCompetitions] ADD  DEFAULT ('Registered') FOR [Status]
GO
ALTER TABLE [dbo].[UserCompetitions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (newid()) FOR [UserID]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('English') FOR [PreferredLanguage]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('User') FOR [Role]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [IsEmailVerified]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('India') FOR [Country]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getutcdate()) FOR [UpdatedDate]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT (newid()) FOR [SessionID]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT (getutcdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT (getutcdate()) FOR [LastAccessedDate]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT (newid()) FOR [StatID]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [TotalCompetitionsParticipated]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [TotalCompetitionsCompleted]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [AverageScore]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [BestScore]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [TotalPointsEarned]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [CurrentStreak]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [LongestStreak]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ((0)) FOR [TotalTimeSpentMinutes]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT ('Beginner') FOR [Level]
GO
ALTER TABLE [dbo].[UserStatistics] ADD  DEFAULT (getutcdate()) FOR [UpdatedDate]
GO
ALTER TABLE [dbo].[Competitions]  WITH CHECK ADD CHECK  (([DifficultyLevel]='Hard' OR [DifficultyLevel]='Medium' OR [DifficultyLevel]='Easy'))
GO
ALTER TABLE [dbo].[Competitions]  WITH CHECK ADD CHECK  (([QuestionsPerPage]=(20) OR [QuestionsPerPage]=(10) OR [QuestionsPerPage]=(5) OR [QuestionsPerPage]=(1)))
GO
ALTER TABLE [dbo].[Competitions]  WITH CHECK ADD CHECK  (([Status]='Cancelled' OR [Status]='Completed' OR [Status]='Active' OR [Status]='Published' OR [Status]='Draft'))
GO
ALTER TABLE [dbo].[Competitions]  WITH CHECK ADD  CONSTRAINT [CK_Competitions_Dates] CHECK  (([EndDate]>[StartDate]))
GO
ALTER TABLE [dbo].[Competitions] CHECK CONSTRAINT [CK_Competitions_Dates]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD CHECK  (([DifficultyLevel]='Hard' OR [DifficultyLevel]='Medium' OR [DifficultyLevel]='Easy'))
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD CHECK  (([Points]>(0)))
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD CHECK  (([QuestionType]='Descriptive' OR [QuestionType]='MCQ'))
GO
ALTER TABLE [dbo].[QuizAttempts]  WITH CHECK ADD CHECK  (([Status]='TimedOut' OR [Status]='Submitted' OR [Status]='Completed' OR [Status]='InProgress'))
GO
ALTER TABLE [dbo].[SystemLogs]  WITH CHECK ADD CHECK  (([LogLevel]='Critical' OR [LogLevel]='Error' OR [LogLevel]='Warning' OR [LogLevel]='Info'))
GO
ALTER TABLE [dbo].[UserCompetitions]  WITH CHECK ADD CHECK  (([Status]='Disqualified' OR [Status]='Completed' OR [Status]='Started' OR [Status]='Registered'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([AgeGroup]='Adult' OR [AgeGroup]='Youth' OR [AgeGroup]='Child'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([Gender]='Other' OR [Gender]='Female' OR [Gender]='Male'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([PreferredLanguage]='Hindi' OR [PreferredLanguage]='English'))
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([Role]='User' OR [Role]='Admin'))
GO
/****** Object:  StoredProcedure [dbo].[sp_CalculateCompetitionRankings]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_CalculateCompetitionRankings]
    @CompetitionID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH RankedResults AS (
        SELECT 
            ResultID,
            ROW_NUMBER() OVER (ORDER BY PercentageScore DESC, CompletionTime ASC) as NewRank,
            COUNT(*) OVER () as TotalParticipants
        FROM CompetitionResults
        WHERE CompetitionID = @CompetitionID
    )
    UPDATE cr
    SET Rank = rr.NewRank,
        TotalParticipants = rr.TotalParticipants
    FROM CompetitionResults cr
    INNER JOIN RankedResults rr ON cr.ResultID = rr.ResultID;
    
    SELECT 'Rankings updated successfully' as Status;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_SubmitQuiz]    Script Date: 09-09-2025 12:39:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_SubmitQuiz]
    @AttemptID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @UserID UNIQUEIDENTIFIER, @CompetitionID UNIQUEIDENTIFIER;
        DECLARE @TotalScore DECIMAL(10,2), @MaxScore DECIMAL(10,2);
        DECLARE @CorrectAnswers INT, @TotalQuestions INT;
        
        -- Get attempt details
        SELECT @UserID = UserID, @CompetitionID = CompetitionID
        FROM QuizAttempts WHERE AttemptID = @AttemptID;
        
        -- Calculate scores
        SELECT 
            @TotalScore = SUM(ISNULL(ua.PointsEarned, 0)),
            @CorrectAnswers = COUNT(CASE WHEN ua.IsCorrect = 1 THEN 1 END),
            @TotalQuestions = COUNT(*)
        FROM UserAnswers ua
        WHERE ua.AttemptID = @AttemptID;
        
        SELECT @MaxScore = SUM(Points)
        FROM Questions q
        INNER JOIN UserAnswers ua ON q.QuestionID = ua.QuestionID
        WHERE ua.AttemptID = @AttemptID;
        
        -- Update quiz attempt
        UPDATE QuizAttempts 
        SET Status = 'Submitted',
            EndTime = GETUTCDATE(),
            SubmittedTime = GETUTCDATE(),
            TotalScore = @TotalScore,
            MaxPossibleScore = @MaxScore,
            AnsweredQuestions = @TotalQuestions,
            CorrectAnswers = @CorrectAnswers
        WHERE AttemptID = @AttemptID;
        
        -- Insert/Update competition result
        MERGE CompetitionResults AS target
        USING (SELECT @CompetitionID as CompetitionID, @UserID as UserID, @AttemptID as AttemptID) AS source
        ON target.CompetitionID = source.CompetitionID AND target.UserID = source.UserID
        WHEN MATCHED THEN
            UPDATE SET FinalScore = @TotalScore, MaxPossibleScore = @MaxScore,
                      CorrectAnswers = @CorrectAnswers, TotalQuestions = @TotalQuestions,
                      CompletionTime = GETUTCDATE(), AttemptID = @AttemptID
        WHEN NOT MATCHED THEN
            INSERT (CompetitionID, UserID, AttemptID, FinalScore, MaxPossibleScore,
                   CorrectAnswers, TotalQuestions, CompletionTime)
            VALUES (@CompetitionID, @UserID, @AttemptID, @TotalScore, @MaxScore,
                   @CorrectAnswers, @TotalQuestions, GETUTCDATE());
        
        -- Update user statistics
        EXEC sp_UpdateUserStatistics @UserID;
        
        COMMIT TRANSACTION;
        
        SELECT 'Success' as Status, @TotalScore as FinalScore, 
               (@TotalScore / @MaxScore * 100) as PercentageScore;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
