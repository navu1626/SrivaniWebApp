# Sarvagyyam Prashanasaar - SQL Server Database Schema

## 🗄️ Database Overview

This document outlines the complete SQL Server database schema for the Sarvagyyam Prashanasaarplatform, designed to support a comprehensive Jain community quiz application with multi-language support, user management, competition handling, and analytics.

## 🏗️ Database Design Principles

- **Normalization**: 3NF compliance to reduce redundancy
- **Scalability**: Designed to handle thousands of users and competitions
- **Performance**: Proper indexing and query optimization
- **Internationalization**: Support for English and Hindi content
- **Audit Trail**: Track all important changes with timestamps
- **Data Integrity**: Foreign key constraints and check constraints

## 📊 Entity Relationship Overview

```
Users (1) ←→ (M) UserCompetitions ←→ (1) Competitions
Users (1) ←→ (M) QuizAttempts ←→ (1) Competitions
Competitions (1) ←→ (M) Questions
Questions (1) ←→ (M) QuestionOptions
Questions (1) ←→ (M) UserAnswers ←→ (1) QuizAttempts
Users (1) ←→ (M) UserSessions
```

## 🗃️ Complete Database Schema

### 1. Users Table
```sql
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
```

### 2. User Sessions Table
```sql
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
```

### 3. Competitions Table
```sql
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
    AllowedQuestionTypes NVARCHAR(50) DEFAULT 'MCQ,Descriptive', -- Comma-separated values
    DifficultyLevel NVARCHAR(20) CHECK (DifficultyLevel IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    Status NVARCHAR(20) CHECK (Status IN ('Draft', 'Published', 'Active', 'Completed', 'Cancelled')) DEFAULT 'Draft',
    IsActive BIT DEFAULT 1,
    TotalQuestions AS (SELECT COUNT(*) FROM Questions WHERE Questions.CompetitionID = Competitions.CompetitionID),
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
```

### 4. Questions Table
```sql
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
```

### 5. Question Options Table (for MCQ questions)
```sql
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
```

### 6. User Competitions Table (Registration)
```sql
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
```

### 7. Quiz Attempts Table
```sql
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
```

### 8. User Answers Table
```sql
CREATE TABLE UserAnswers (
    AnswerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AttemptID UNIQUEIDENTIFIER NOT NULL,
    QuestionID UNIQUEIDENTIFIER NOT NULL,
    SelectedOptionID UNIQUEIDENTIFIER, -- For MCQ questions
    DescriptiveAnswer NVARCHAR(MAX), -- For descriptive questions
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
```

### 9. Competition Results Table
```sql
CREATE TABLE CompetitionResults (
    ResultID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CompetitionID UNIQUEIDENTIFIER NOT NULL,
    UserID UNIQUEIDENTIFIER NOT NULL,
    AttemptID UNIQUEIDENTIFIER NOT NULL,
    FinalScore DECIMAL(10,2) NOT NULL,
    MaxPossibleScore DECIMAL(10,2) NOT NULL,
    PercentageScore AS (FinalScore / MaxPossibleScore * 100) PERSISTED,
    Rank INT,
    TotalParticipants INT,
    CompletionTime DATETIME2,
    TimeSpentMinutes INT,
    CorrectAnswers INT,
    TotalQuestions INT,
    Certificate NVARCHAR(500), -- URL to certificate
    IsPublished BIT DEFAULT 0,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_CompetitionResults_Competition FOREIGN KEY (CompetitionID) REFERENCES Competitions(CompetitionID) ON DELETE CASCADE,
    CONSTRAINT FK_CompetitionResults_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_CompetitionResults_Attempt FOREIGN KEY (AttemptID) REFERENCES QuizAttempts(AttemptID) ON DELETE CASCADE,
    CONSTRAINT UQ_CompetitionResults UNIQUE (CompetitionID, UserID)
);

-- Indexes for CompetitionResults table
CREATE INDEX IX_CompetitionResults_CompetitionID ON CompetitionResults(CompetitionID);
CREATE INDEX IX_CompetitionResults_UserID ON CompetitionResults(UserID);
CREATE INDEX IX_CompetitionResults_Rank ON CompetitionResults(CompetitionID, Rank);
CREATE INDEX IX_CompetitionResults_PercentageScore ON CompetitionResults(PercentageScore DESC);
```

### 10. User Statistics Table
```sql
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
    Badges NVARCHAR(MAX), -- JSON array of earned badges
    UpdatedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_UserStatistics_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT UQ_UserStatistics_User UNIQUE (UserID)
);

-- Indexes for UserStatistics table
CREATE INDEX IX_UserStatistics_UserID ON UserStatistics(UserID);
CREATE INDEX IX_UserStatistics_AverageScore ON UserStatistics(AverageScore DESC);
CREATE INDEX IX_UserStatistics_Level ON UserStatistics(Level);
```

### 11. System Logs Table
```sql
CREATE TABLE SystemLogs (
    LogID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER,
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(50), -- Users, Competitions, Questions, etc.
    EntityID UNIQUEIDENTIFIER,
    Details NVARCHAR(MAX), -- JSON details
    IPAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    LogLevel NVARCHAR(20) CHECK (LogLevel IN ('Info', 'Warning', 'Error', 'Critical')) DEFAULT 'Info',
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_SystemLogs_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Indexes for SystemLogs table
CREATE INDEX IX_SystemLogs_UserID ON SystemLogs(UserID);
CREATE INDEX IX_SystemLogs_Action ON SystemLogs(Action);
CREATE INDEX IX_SystemLogs_CreatedDate ON SystemLogs(CreatedDate);
CREATE INDEX IX_SystemLogs_LogLevel ON SystemLogs(LogLevel);
```

### 12. File Uploads Table
```sql
CREATE TABLE FileUploads (
    FileID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FileName NVARCHAR(255) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    MimeType NVARCHAR(100) NOT NULL,
    FileURL NVARCHAR(500) NOT NULL,
    EntityType NVARCHAR(50), -- Competition, Question, User, etc.
    EntityID UNIQUEIDENTIFIER,
    UploadedBy UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_FileUploads_User FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
);

-- Indexes for FileUploads table
CREATE INDEX IX_FileUploads_EntityType ON FileUploads(EntityType, EntityID);
CREATE INDEX IX_FileUploads_UploadedBy ON FileUploads(UploadedBy);
CREATE INDEX IX_FileUploads_CreatedDate ON FileUploads(CreatedDate);
```

## 🔧 Database Views

### 1. Competition Summary View
```sql
CREATE VIEW vw_CompetitionSummary AS
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
```

### 2. User Performance View
```sql
CREATE VIEW vw_UserPerformance AS
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
```

## 🔍 Stored Procedures

### 1. User Registration Procedure
```sql
CREATE PROCEDURE sp_RegisterUser
    @Email NVARCHAR(255),
    @Password NVARCHAR(255),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @MobileNumber NVARCHAR(20),
    @DateOfBirth DATE,
    @AgeGroup NVARCHAR(20),
    @PreferredLanguage NVARCHAR(10) = 'English'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
    DECLARE @Salt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
    DECLARE @PasswordHash NVARCHAR(255);
    
    -- Hash password with salt (implement proper hashing)
    SET @PasswordHash = HASHBYTES('SHA2_256', @Password + @Salt);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Insert user
        INSERT INTO Users (UserID, Email, PasswordHash, Salt, FirstName, LastName, 
                          MobileNumber, DateOfBirth, AgeGroup, PreferredLanguage)
        VALUES (@UserID, @Email, @PasswordHash, @Salt, @FirstName, @LastName,
                @MobileNumber, @DateOfBirth, @AgeGroup, @PreferredLanguage);
        
        -- Initialize user statistics
        INSERT INTO UserStatistics (UserID)
        VALUES (@UserID);
        
        COMMIT TRANSACTION;
        
        SELECT @UserID as UserID, 'Success' as Status;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
```

### 2. Submit Quiz Procedure
```sql
CREATE PROCEDURE sp_SubmitQuiz
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
```

### 3. Calculate Competition Rankings
```sql
CREATE PROCEDURE sp_CalculateCompetitionRankings
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
```

## 🔐 Security Considerations

### 1. Data Encryption
```sql
-- Enable Transparent Data Encryption (TDE)
ALTER DATABASE SrivaniQuizDB SET ENCRYPTION ON;

-- Create certificate for column-level encryption
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'YourStrongPassword123!';
CREATE CERTIFICATE SrivaniQuizCert WITH SUBJECT = 'SrivaniQuiz Certificate';
CREATE SYMMETRIC KEY SrivaniQuizKey WITH ALGORITHM = AES_256 ENCRYPTION BY CERTIFICATE SrivaniQuizCert;
```

### 2. Row Level Security (RLS)
```sql
-- Enable RLS for Users table
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;

-- Create security policy
CREATE FUNCTION fn_UserSecurityPredicate(@UserID UNIQUEIDENTIFIER)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS fn_UserSecurityPredicate_result
WHERE @UserID = CAST(SESSION_CONTEXT(N'UserID') AS UNIQUEIDENTIFIER)
   OR IS_MEMBER('db_owner') = 1;

CREATE SECURITY POLICY UserSecurityPolicy
ADD FILTER PREDICATE fn_UserSecurityPredicate(UserID) ON Users,
ADD BLOCK PREDICATE fn_UserSecurityPredicate(UserID) ON Users AFTER UPDATE;
```

## 📊 Performance Optimization

### 1. Partitioning Strategy
```sql
-- Partition QuizAttempts by date
CREATE PARTITION FUNCTION pf_QuizAttemptsByDate (DATETIME2)
AS RANGE RIGHT FOR VALUES 
('2024-01-01', '2024-04-01', '2024-07-01', '2024-10-01', '2025-01-01');

CREATE PARTITION SCHEME ps_QuizAttemptsByDate
AS PARTITION pf_QuizAttemptsByDate ALL TO ([PRIMARY]);

-- Apply partitioning to QuizAttempts table
CREATE CLUSTERED INDEX IX_QuizAttempts_Partitioned 
ON QuizAttempts (StartTime, AttemptID) ON ps_QuizAttemptsByDate(StartTime);
```

### 2. Columnstore Indexes for Analytics
```sql
-- Create columnstore index for analytics queries
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_CompetitionResults_Analytics
ON CompetitionResults (CompetitionID, UserID, FinalScore, PercentageScore, CompletionTime);

CREATE NONCLUSTERED COLUMNSTORE INDEX IX_UserAnswers_Analytics
ON UserAnswers (QuestionID, IsCorrect, PointsEarned, TimeSpentSeconds);
```

## 🔄 Data Maintenance

### 1. Cleanup Procedures
```sql
CREATE PROCEDURE sp_CleanupOldData
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Archive old quiz attempts (older than 2 years)
    DELETE FROM QuizAttempts 
    WHERE StartTime < DATEADD(YEAR, -2, GETUTCDATE())
    AND Status IN ('Abandoned', 'TimedOut');
    
    -- Clean up expired sessions
    DELETE FROM UserSessions 
    WHERE ExpiresAt < GETUTCDATE();
    
    -- Archive old system logs (older than 1 year)
    DELETE FROM SystemLogs 
    WHERE CreatedDate < DATEADD(YEAR, -1, GETUTCDATE())
    AND LogLevel = 'Info';
END;
```

### 2. Backup Strategy
```sql
-- Full backup weekly
BACKUP DATABASE SrivaniQuizDB 
TO DISK = 'C:\Backups\SrivaniQuizDB_Full.bak'
WITH FORMAT, COMPRESSION, CHECKSUM;

-- Differential backup daily
BACKUP DATABASE SrivaniQuizDB 
TO DISK = 'C:\Backups\SrivaniQuizDB_Diff.bak'
WITH DIFFERENTIAL, COMPRESSION, CHECKSUM;

-- Transaction log backup every 15 minutes
BACKUP LOG SrivaniQuizDB 
TO DISK = 'C:\Backups\SrivaniQuizDB_Log.trn'
WITH COMPRESSION, CHECKSUM;
```

## 📈 Monitoring and Analytics

### 1. Performance Monitoring Views
```sql
CREATE VIEW vw_DatabasePerformance AS
SELECT 
    DB_NAME() as DatabaseName,
    (SELECT COUNT(*) FROM Users WHERE IsActive = 1) as ActiveUsers,
    (SELECT COUNT(*) FROM Competitions WHERE Status = 'Active') as ActiveCompetitions,
    (SELECT COUNT(*) FROM QuizAttempts WHERE StartTime >= DATEADD(DAY, -1, GETUTCDATE())) as QuizzesToday,
    (SELECT AVG(DATEDIFF(SECOND, StartTime, EndTime)) FROM QuizAttempts WHERE EndTime IS NOT NULL) as AvgQuizDuration;
```

### 2. Usage Analytics
```sql
CREATE VIEW vw_UsageAnalytics AS
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
```

## 🚀 Deployment Scripts

### 1. Initial Database Setup
```sql
-- Create database
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

-- Set database options
ALTER DATABASE SrivaniQuizDB SET RECOVERY FULL;
ALTER DATABASE SrivaniQuizDB SET AUTO_CREATE_STATISTICS ON;
ALTER DATABASE SrivaniQuizDB SET AUTO_UPDATE_STATISTICS ON;
```

### 2. Sample Data Insertion
```sql
-- Insert sample admin user
INSERT INTO Users (Email, PasswordHash, Salt, FirstName, LastName, AgeGroup, Role, IsEmailVerified)
VALUES ('admin@srivani.com', 'hashed_password', 'salt_value', 'Admin', 'User', 'Adult', 'Admin', 1);

-- Insert sample competition
INSERT INTO Competitions (Title, TitleHindi, Description, StartDate, EndDate, CreatedBy, Status)
VALUES ('Jain Philosophy Quiz', 'जैन दर्शन प्रश्नोत्तरी', 'Test your knowledge of Jain philosophy', 
        GETUTCDATE(), DATEADD(DAY, 7, GETUTCDATE()), 
        (SELECT UserID FROM Users WHERE Email = 'admin@srivani.com'), 'Published');
```

---

**Note**: This schema is designed to be production-ready with proper indexing, constraints, and security measures. Regular maintenance, monitoring, and optimization should be performed based on actual usage patterns.