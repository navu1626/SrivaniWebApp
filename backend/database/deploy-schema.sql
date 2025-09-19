-- SrivaniQuiz Database Schema Deployment Script
-- This script creates the complete database schema for the SrivaniQuiz application

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SrivaniQuizDB')
BEGIN
    CREATE DATABASE SrivaniQuizDB
    ON (
        NAME = 'SrivaniQuizDB_Data',
        FILENAME = 'C:\Data\SrivaniQuizDB.mdf',
        SIZE = 1GB,
        MAXSIZE = 10GB,
        FILEGROWTH = 100MB
    )
    LOG ON (
        NAME = 'SrivaniQuizDB_Log',
        FILENAME = 'C:\Data\SrivaniQuizDB.ldf',
        SIZE = 100MB,
        MAXSIZE = 1GB,
        FILEGROWTH = 10MB
    );
    
    PRINT '✅ Database SrivaniQuizDB created successfully';
END
ELSE
BEGIN
    PRINT '✅ Database SrivaniQuizDB already exists';
END
GO

-- Use the database
USE SrivaniQuizDB;
GO

-- Set database options
ALTER DATABASE SrivaniQuizDB SET RECOVERY FULL;
ALTER DATABASE SrivaniQuizDB SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE SrivaniQuizDB SET AUTO_UPDATE_STATISTICS ON;
GO

PRINT '🔄 Starting schema deployment...';

-- 1. Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Salt NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        FullName AS (FirstName + ' ' + LastName) PERSISTED,
        MobileNumber NVARCHAR(20),
        DateOfBirth DATE,
        AgeGroup NVARCHAR(20) CHECK (AgeGroup IN ('Child', 'Youth', 'Adult')) NOT NULL,
        Gender NVARCHAR(10) CHECK (Gender IN ('Male', 'Female', 'Other')),
        PreferredLanguage NVARCHAR(10) CHECK (PreferredLanguage IN ('English', 'Hindi')) DEFAULT 'English',
        Role NVARCHAR(20) CHECK (Role IN ('Admin', 'User')) DEFAULT 'User',
        IsActive BIT DEFAULT 1,
        IsEmailVerified BIT DEFAULT 0,
        EmailVerificationToken NVARCHAR(255),
        PasswordResetToken NVARCHAR(255),
        PasswordResetExpiry DATETIME2,
        LastLoginDate DATETIME2,
        ProfileImageURL NVARCHAR(500),
        City NVARCHAR(100),
        State NVARCHAR(100),
        Country NVARCHAR(100) DEFAULT 'India',
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedDate DATETIME2 DEFAULT GETUTCDATE(),
        CreatedBy UNIQUEIDENTIFIER,
        UpdatedBy UNIQUEIDENTIFIER
    );

    -- Indexes for Users table
    CREATE INDEX IX_Users_Email ON Users(Email);
    CREATE INDEX IX_Users_Role ON Users(Role);
    CREATE INDEX IX_Users_AgeGroup ON Users(AgeGroup);
    CREATE INDEX IX_Users_IsActive ON Users(IsActive);
    CREATE INDEX IX_Users_CreatedDate ON Users(CreatedDate);
    
    PRINT '✅ Users table created';
END
ELSE
BEGIN
    PRINT '✅ Users table already exists';
END
GO

-- 2. User Sessions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSessions')
BEGIN
    CREATE TABLE UserSessions (
        SessionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        SessionToken NVARCHAR(255) NOT NULL UNIQUE,
        RefreshToken NVARCHAR(255),
        IPAddress NVARCHAR(45),
        UserAgent NVARCHAR(500),
        IsActive BIT DEFAULT 1,
        ExpiresAt DATETIME2 NOT NULL,
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        LastAccessedDate DATETIME2 DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_UserSessions_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );

    -- Indexes for UserSessions table
    CREATE INDEX IX_UserSessions_UserID ON UserSessions(UserID);
    CREATE INDEX IX_UserSessions_SessionToken ON UserSessions(SessionToken);
    CREATE INDEX IX_UserSessions_IsActive ON UserSessions(IsActive);
    
    PRINT '✅ UserSessions table created';
END
ELSE
BEGIN
    PRINT '✅ UserSessions table already exists';
END
GO

-- 3. Competitions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Competitions')
BEGIN
    CREATE TABLE Competitions (
        CompetitionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Title NVARCHAR(200) NOT NULL,
        TitleHindi NVARCHAR(200),
        Description NVARCHAR(1000) NOT NULL,
        DescriptionHindi NVARCHAR(1000),
        BannerImageURL NVARCHAR(500),
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        RegistrationStartDate DATETIME2,
        RegistrationEndDate DATETIME2,
        HasTimeLimit BIT DEFAULT 0,
        TimeLimitMinutes INT,
        MaxParticipants INT,
        QuestionsPerPage INT DEFAULT 1 CHECK (QuestionsPerPage IN (1, 5, 10, 20)),
        AllowedQuestionTypes NVARCHAR(50) DEFAULT 'MCQ,Descriptive',
        DifficultyLevel NVARCHAR(20) CHECK (DifficultyLevel IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
        Status NVARCHAR(20) CHECK (Status IN ('Draft', 'Published', 'Active', 'Completed', 'Cancelled')) DEFAULT 'Draft',
        IsActive BIT DEFAULT 1,
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedDate DATETIME2 DEFAULT GETUTCDATE(),
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        UpdatedBy UNIQUEIDENTIFIER,
        
        CONSTRAINT FK_Competitions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
        CONSTRAINT FK_Competitions_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID),
        CONSTRAINT CK_Competitions_Dates CHECK (EndDate > StartDate),
        CONSTRAINT CK_Competitions_Registration CHECK (RegistrationEndDate IS NULL OR RegistrationEndDate <= StartDate)
    );

    -- Indexes for Competitions table
    CREATE INDEX IX_Competitions_Status ON Competitions(Status);
    CREATE INDEX IX_Competitions_StartDate ON Competitions(StartDate);
    CREATE INDEX IX_Competitions_EndDate ON Competitions(EndDate);
    CREATE INDEX IX_Competitions_CreatedBy ON Competitions(CreatedBy);
    CREATE INDEX IX_Competitions_IsActive ON Competitions(IsActive);
    
    PRINT '✅ Competitions table created';
END
ELSE
BEGIN
    PRINT '✅ Competitions table already exists';
END
GO

-- 4. Questions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Questions')
BEGIN
    CREATE TABLE Questions (
        QuestionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        CompetitionID UNIQUEIDENTIFIER NOT NULL,
        QuestionText NVARCHAR(2000) NOT NULL,
        QuestionTextHindi NVARCHAR(2000),
        QuestionType NVARCHAR(20) CHECK (QuestionType IN ('MCQ', 'Descriptive')) NOT NULL,
        QuestionImageURL NVARCHAR(500),
        Points INT DEFAULT 1 CHECK (Points > 0),
        TimeLimitSeconds INT,
        DifficultyLevel NVARCHAR(20) CHECK (DifficultyLevel IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
        OrderIndex INT NOT NULL,
        IsActive BIT DEFAULT 1,
        Explanation NVARCHAR(1000),
        ExplanationHindi NVARCHAR(1000),
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedDate DATETIME2 DEFAULT GETUTCDATE(),
        CreatedBy UNIQUEIDENTIFIER NOT NULL,
        UpdatedBy UNIQUEIDENTIFIER,
        
        CONSTRAINT FK_Questions_Competition FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID) ON DELETE CASCADE,
        CONSTRAINT FK_Questions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
        CONSTRAINT FK_Questions_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
    );

    -- Indexes for Questions table
    CREATE INDEX IX_Questions_CompetitionID ON Questions(CompetitionID);
    CREATE INDEX IX_Questions_QuestionType ON Questions(QuestionType);
    CREATE INDEX IX_Questions_OrderIndex ON Questions(CompetitionID, OrderIndex);
    CREATE INDEX IX_Questions_IsActive ON Questions(IsActive);
    
    PRINT '✅ Questions table created';
END
ELSE
BEGIN
    PRINT '✅ Questions table already exists';
END
GO

-- 5. Question Options Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuestionOptions')
BEGIN
    CREATE TABLE QuestionOptions (
        OptionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        QuestionID UNIQUEIDENTIFIER NOT NULL,
        OptionText NVARCHAR(500) NOT NULL,
        OptionTextHindi NVARCHAR(500),
        OptionImageURL NVARCHAR(500),
        IsCorrect BIT DEFAULT 0,
        OrderIndex INT NOT NULL,
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_QuestionOptions_Question FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE
    );

    -- Indexes for QuestionOptions table
    CREATE INDEX IX_QuestionOptions_QuestionID ON QuestionOptions(QuestionID);
    CREATE INDEX IX_QuestionOptions_IsCorrect ON QuestionOptions(QuestionID, IsCorrect);
    
    PRINT '✅ QuestionOptions table created';
END
ELSE
BEGIN
    PRINT '✅ QuestionOptions table already exists';
END
GO

-- 6. User Competitions Table (Registration)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserCompetitions')
BEGIN
    CREATE TABLE UserCompetitions (
        UserCompetitionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        CompetitionID UNIQUEIDENTIFIER NOT NULL,
        RegistrationDate DATETIME2 DEFAULT GETUTCDATE(),
        Status NVARCHAR(20) CHECK (Status IN ('Registered', 'Started', 'Completed', 'Disqualified')) DEFAULT 'Registered',
        IsActive BIT DEFAULT 1,

        CONSTRAINT FK_UserCompetitions_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        CONSTRAINT FK_UserCompetitions_Competition FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID) ON DELETE CASCADE,
        CONSTRAINT UQ_UserCompetitions UNIQUE (UserID, CompetitionID)
    );

    -- Indexes for UserCompetitions table
    CREATE INDEX IX_UserCompetitions_UserID ON UserCompetitions(UserID);
    CREATE INDEX IX_UserCompetitions_CompetitionID ON UserCompetitions(CompetitionID);
    CREATE INDEX IX_UserCompetitions_Status ON UserCompetitions(Status);

    PRINT '✅ UserCompetitions table created';
END
ELSE
BEGIN
    PRINT '✅ UserCompetitions table already exists';
END
GO

-- 7. Quiz Attempts Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuizAttempts')
BEGIN
    CREATE TABLE QuizAttempts (
        AttemptID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        CompetitionID UNIQUEIDENTIFIER NOT NULL,
        StartTime DATETIME2 DEFAULT GETUTCDATE(),
        EndTime DATETIME2,
        SubmittedTime DATETIME2,
        Status NVARCHAR(20) CHECK (Status IN ('InProgress', 'Completed', 'Submitted', 'TimedOut', 'Abandoned')) DEFAULT 'InProgress',
        TotalScore DECIMAL(10,2) DEFAULT 0,
        MaxPossibleScore DECIMAL(10,2),
        PercentageScore AS (CASE WHEN MaxPossibleScore > 0 THEN (TotalScore / MaxPossibleScore) * 100 ELSE 0 END) PERSISTED,
        TotalQuestions INT DEFAULT 0,
        AnsweredQuestions INT DEFAULT 0,
        CorrectAnswers INT DEFAULT 0,
        TimeSpentMinutes AS (CASE WHEN EndTime IS NOT NULL THEN DATEDIFF(MINUTE, StartTime, EndTime) ELSE NULL END) PERSISTED,
        CurrentQuestionIndex INT DEFAULT 0,
        IPAddress NVARCHAR(45),
        UserAgent NVARCHAR(500),
        IsActive BIT DEFAULT 1,

        CONSTRAINT FK_QuizAttempts_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        CONSTRAINT FK_QuizAttempts_Competition FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID) ON DELETE CASCADE
    );

    -- Indexes for QuizAttempts table
    CREATE INDEX IX_QuizAttempts_UserID ON QuizAttempts(UserID);
    CREATE INDEX IX_QuizAttempts_CompetitionID ON QuizAttempts(CompetitionID);
    CREATE INDEX IX_QuizAttempts_Status ON QuizAttempts(Status);
    CREATE INDEX IX_QuizAttempts_StartTime ON QuizAttempts(StartTime);
    CREATE INDEX IX_QuizAttempts_PercentageScore ON QuizAttempts(PercentageScore);

    PRINT '✅ QuizAttempts table created';
END
ELSE
BEGIN
    PRINT '✅ QuizAttempts table already exists';
END
GO

-- 8. User Answers Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAnswers')
BEGIN
    CREATE TABLE UserAnswers (
        AnswerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AttemptID UNIQUEIDENTIFIER NOT NULL,
        QuestionID UNIQUEIDENTIFIER NOT NULL,
        SelectedOptionID UNIQUEIDENTIFIER,
        DescriptiveAnswer NVARCHAR(MAX),
        IsCorrect BIT,
        PointsEarned DECIMAL(10,2) DEFAULT 0,
        TimeSpentSeconds INT,
        AnsweredAt DATETIME2 DEFAULT GETUTCDATE(),
        IsMarkedForReview BIT DEFAULT 0,

        CONSTRAINT FK_UserAnswers_Attempt FOREIGN KEY (AttemptID) REFERENCES QuizAttempts(AttemptID) ON DELETE CASCADE,
        CONSTRAINT FK_UserAnswers_Question FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE,
        CONSTRAINT FK_UserAnswers_Option FOREIGN KEY (SelectedOptionID) REFERENCES QuestionOptions(OptionID),
        CONSTRAINT UQ_UserAnswers UNIQUE (AttemptID, QuestionID)
    );

    -- Indexes for UserAnswers table
    CREATE INDEX IX_UserAnswers_AttemptID ON UserAnswers(AttemptID);
    CREATE INDEX IX_UserAnswers_QuestionID ON UserAnswers(QuestionID);
    CREATE INDEX IX_UserAnswers_IsCorrect ON UserAnswers(IsCorrect);

    PRINT '✅ UserAnswers table created';
END
ELSE
BEGIN
    PRINT '✅ UserAnswers table already exists';
END
GO

-- 9. User Statistics Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserStatistics')
BEGIN
    CREATE TABLE UserStatistics (
        StatID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        TotalCompetitionsParticipated INT DEFAULT 0,
        TotalCompetitionsCompleted INT DEFAULT 0,
        AverageScore DECIMAL(5,2) DEFAULT 0,
        BestScore DECIMAL(5,2) DEFAULT 0,
        TotalPointsEarned DECIMAL(10,2) DEFAULT 0,
        CurrentStreak INT DEFAULT 0,
        LongestStreak INT DEFAULT 0,
        TotalTimeSpentMinutes INT DEFAULT 0,
        FavoriteCategory NVARCHAR(100),
        LastActivityDate DATETIME2,
        Level NVARCHAR(50) DEFAULT 'Beginner',
        Badges NVARCHAR(MAX),
        UpdatedDate DATETIME2 DEFAULT GETUTCDATE(),

        CONSTRAINT FK_UserStatistics_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        CONSTRAINT UQ_UserStatistics_User UNIQUE (UserID)
    );

    -- Indexes for UserStatistics table
    CREATE INDEX IX_UserStatistics_UserID ON UserStatistics(UserID);
    CREATE INDEX IX_UserStatistics_AverageScore ON UserStatistics(AverageScore DESC);
    CREATE INDEX IX_UserStatistics_Level ON UserStatistics(Level);

    PRINT '✅ UserStatistics table created';
END
ELSE
BEGIN
    PRINT '✅ UserStatistics table already exists';
END
GO

PRINT '🎉 Schema deployment completed successfully!';
PRINT '📊 Database is ready for the SrivaniQuiz application';
GO
