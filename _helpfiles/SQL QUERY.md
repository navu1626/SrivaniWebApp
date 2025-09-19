select * from [dbo].Users

--truncate table [UserSessions]
select * from [dbo].[UserSessions]

--truncate table [Competitions]
select * from [dbo].[Competitions]

--truncate table QuestionOptions
select * from QuestionOptions

--truncate table Questions
select * from dbo.Questions.QuestionImageURL

--truncate table QuizAttempts
select * from QuizAttempts

--truncate table QuizAttemptAnswers
select * from QuizAttemptAnswers

--truncate table [UserStatistics]
select * from [dbo].[UserStatistics]

---------------------------------------
select * from  [dbo].[UserAnswers]

select * from [dbo].[UserCompetitions]


--update Users set Role='Admin' 



--delete from [Competitions]

--delete from [dbo].[UserCompetitions]



--ALTER TABLE Competitions
--ALTER COLUMN Description NVARCHAR(max);

--ALTER TABLE Competitions
--ALTER COLUMN DescriptionHindi NVARCHAR(max);
--DROP TABLE   QuizAttemptAnswers 




--select * from [dbo].[Competitions]

--select * from QuizAttempts

--select * from QuizAttemptAnswers



--dbo.Questions.QuestionImageURL


--alter table Questions drop constraint FK_Questions_CreatedBy


--select * from [dbo].[UserCompetitions]
--select * from [dbo].[QuizAttemptAnswers]
--select * from [dbo].[UserStatistics]

--select * from [dbo].[Competitions]
--select * from QuizAttempts

--SELECT c.*, 
--              (SELECT COUNT(*) FROM Questions q WHERE q.CompetitionID=c.CompetitionID AND q.IsActive=1) AS TotalQuestions
--       FROM Competitions c
--       WHERE c.Status='Published' 
--         AND c.IsActive=1
--         AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()
--         AND NOT EXISTS (
--           SELECT 1 FROM QuizAttempts qa 
--           WHERE qa.UserID='DABCD8A9-F06A-411B-BE5F-7D093001C092'
--           AND qa.CompetitionID='E202BB9D-EBDD-4A5A-83D6-0EF15F1D447D' AND qa.Status='InProgress'
--         )
--       ORDER BY c.StartDate DESC