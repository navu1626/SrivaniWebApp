-- SrivaniQuiz Sample Data Insertion Script
-- This script inserts sample data for testing the application

USE SrivaniQuizDB;
GO

PRINT '🔄 Inserting sample data...';

-- Insert sample admin user
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin@srivani.com')
BEGIN
    DECLARE @AdminUserID UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO Users (
        UserID, Email, PasswordHash, Salt, FirstName, LastName, 
        AgeGroup, Role, IsEmailVerified, PreferredLanguage
    ) VALUES (
        @AdminUserID, 
        'admin@srivani.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: admin123
        'sample-salt-admin',
        'Admin', 
        'User', 
        'Adult', 
        'Admin', 
        1,
        'English'
    );
    
    -- Initialize admin statistics
    INSERT INTO UserStatistics (UserID) VALUES (@AdminUserID);
    
    PRINT '✅ Admin user created: admin@srivani.com / admin123';
END
ELSE
BEGIN
    PRINT '✅ Admin user already exists';
END
GO

-- Insert sample regular user
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'user@srivani.com')
BEGIN
    DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO Users (
        UserID, Email, PasswordHash, Salt, FirstName, LastName, 
        AgeGroup, Role, IsEmailVerified, PreferredLanguage, City, State
    ) VALUES (
        @UserID, 
        'user@srivani.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: user123
        'sample-salt-user',
        'Test', 
        'User', 
        'Youth', 
        'User', 
        1,
        'Hindi',
        'Mumbai',
        'Maharashtra'
    );
    
    -- Initialize user statistics
    INSERT INTO UserStatistics (UserID) VALUES (@UserID);
    
    PRINT '✅ Regular user created: user@srivani.com / user123';
END
ELSE
BEGIN
    PRINT '✅ Regular user already exists';
END
GO

-- Insert sample competition
IF NOT EXISTS (SELECT * FROM Competitions WHERE Title = 'Jain Philosophy Basics')
BEGIN
    DECLARE @CompetitionID UNIQUEIDENTIFIER = NEWID();
    DECLARE @AdminUserID UNIQUEIDENTIFIER = (SELECT UserID FROM Users WHERE Email = 'admin@srivani.com');
    
    INSERT INTO Competitions (
        CompetitionID, Title, TitleHindi, Description, DescriptionHindi,
        StartDate, EndDate, DifficultyLevel, Status, CreatedBy, QuestionsPerPage
    ) VALUES (
        @CompetitionID,
        'Jain Philosophy Basics',
        'जैन दर्शन की मूल बातें',
        'Test your knowledge of fundamental Jain principles, history, and philosophy. This quiz covers the basic concepts every Jain should know.',
        'जैन सिद्धांतों, इतिहास और दर्शन के मूलभूत ज्ञान का परीक्षण करें। इस प्रश्नोत्तरी में वे बुनियादी अवधारणाएं शामिल हैं जिन्हें हर जैन को जानना चाहिए।',
        GETUTCDATE(),
        DATEADD(DAY, 30, GETUTCDATE()),
        'Easy',
        'Published',
        @AdminUserID,
        1
    );
    
    -- Insert sample questions for the competition
    DECLARE @Question1ID UNIQUEIDENTIFIER = NEWID();
    DECLARE @Question2ID UNIQUEIDENTIFIER = NEWID();
    DECLARE @Question3ID UNIQUEIDENTIFIER = NEWID();
    
    -- Question 1: MCQ about Tirthankaras
    INSERT INTO Questions (
        QuestionID, CompetitionID, QuestionText, QuestionTextHindi,
        QuestionType, Points, OrderIndex, CreatedBy
    ) VALUES (
        @Question1ID, @CompetitionID,
        'How many Tirthankaras are there in Jainism?',
        'जैन धर्म में कितने तीर्थंकर हैं?',
        'MCQ', 1, 1, @AdminUserID
    );
    
    -- Options for Question 1
    INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, IsCorrect, OrderIndex) VALUES
    (@Question1ID, '22', '२२', 0, 1),
    (@Question1ID, '24', '२४', 1, 2),
    (@Question1ID, '26', '२६', 0, 3),
    (@Question1ID, '28', '२८', 0, 4);
    
    -- Question 2: MCQ about Mahavira
    INSERT INTO Questions (
        QuestionID, CompetitionID, QuestionText, QuestionTextHindi,
        QuestionType, Points, OrderIndex, CreatedBy
    ) VALUES (
        @Question2ID, @CompetitionID,
        'Lord Mahavira was the _____ Tirthankara.',
        'भगवान महावीर _____ तीर्थंकर थे।',
        'MCQ', 1, 2, @AdminUserID
    );
    
    -- Options for Question 2
    INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, IsCorrect, OrderIndex) VALUES
    (@Question2ID, '23rd', '२३वें', 0, 1),
    (@Question2ID, '24th', '२४वें', 1, 2),
    (@Question2ID, '1st', '१ले', 0, 3),
    (@Question2ID, '22nd', '२२वें', 0, 4);
    
    -- Question 3: MCQ about Ahimsa
    INSERT INTO Questions (
        QuestionID, CompetitionID, QuestionText, QuestionTextHindi,
        QuestionType, Points, OrderIndex, CreatedBy
    ) VALUES (
        @Question3ID, @CompetitionID,
        'What is the first and most important principle of Jainism?',
        'जैन धर्म का पहला और सबसे महत्वपूर्ण सिद्धांत क्या है?',
        'MCQ', 1, 3, @AdminUserID
    );
    
    -- Options for Question 3
    INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, IsCorrect, OrderIndex) VALUES
    (@Question3ID, 'Satya (Truth)', 'सत्य', 0, 1),
    (@Question3ID, 'Ahimsa (Non-violence)', 'अहिंसा', 1, 2),
    (@Question3ID, 'Asteya (Non-stealing)', 'अस्तेय', 0, 3),
    (@Question3ID, 'Aparigraha (Non-possessiveness)', 'अपरिग्रह', 0, 4);
    
    PRINT '✅ Sample competition created with 3 questions';
END
ELSE
BEGIN
    PRINT '✅ Sample competition already exists';
END
GO

-- Insert another sample competition
IF NOT EXISTS (SELECT * FROM Competitions WHERE Title = 'Jain Festivals and Traditions')
BEGIN
    DECLARE @CompetitionID2 UNIQUEIDENTIFIER = NEWID();
    DECLARE @AdminUserID UNIQUEIDENTIFIER = (SELECT UserID FROM Users WHERE Email = 'admin@srivani.com');
    
    INSERT INTO Competitions (
        CompetitionID, Title, TitleHindi, Description, DescriptionHindi,
        StartDate, EndDate, DifficultyLevel, Status, CreatedBy, QuestionsPerPage
    ) VALUES (
        @CompetitionID2,
        'Jain Festivals and Traditions',
        'जैन त्योहार और परंपराएं',
        'Explore the rich traditions and festivals of Jainism. Learn about Paryushan, Diwali, and other important celebrations.',
        'जैन धर्म की समृद्ध परंपराओं और त्योहारों का अन्वेषण करें। पर्युषण, दिवाली और अन्य महत्वपूर्ण उत्सवों के बारे में जानें।',
        DATEADD(DAY, 7, GETUTCDATE()),
        DATEADD(DAY, 37, GETUTCDATE()),
        'Medium',
        'Published',
        @AdminUserID,
        5
    );
    
    PRINT '✅ Second sample competition created';
END
ELSE
BEGIN
    PRINT '✅ Second sample competition already exists';
END
GO

-- Register sample user for competitions
DECLARE @UserID UNIQUEIDENTIFIER = (SELECT UserID FROM Users WHERE Email = 'user@srivani.com');
DECLARE @CompetitionID UNIQUEIDENTIFIER = (SELECT CompetitionID FROM Competitions WHERE Title = 'Jain Philosophy Basics');

IF @UserID IS NOT NULL AND @CompetitionID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM UserCompetitions WHERE UserID = @UserID AND CompetitionID = @CompetitionID)
    BEGIN
        INSERT INTO UserCompetitions (UserID, CompetitionID, Status) 
        VALUES (@UserID, @CompetitionID, 'Registered');
        
        PRINT '✅ Sample user registered for competition';
    END
    ELSE
    BEGIN
        PRINT '✅ Sample user already registered for competition';
    END
END
GO

PRINT '🎉 Sample data insertion completed successfully!';
PRINT '📊 You can now test the application with:';
PRINT '   👤 Admin: admin@srivani.com / admin123';
PRINT '   👤 User: user@srivani.com / user123';
PRINT '   🏆 Sample competitions are available';
GO
