"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizService = exports.QuizService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class QuizService {
    async startQuiz(userId, competitionId) {
        const existing = await (0, database_1.executeQuery)(`SELECT TOP 1 AttemptID FROM QuizAttempts
       WHERE UserID=@UserID AND CompetitionID=@CompetitionID AND Status='InProgress'
       ORDER BY StartTime DESC`, { UserID: userId, CompetitionID: competitionId });
        const ex = existing.recordset?.[0];
        if (ex?.AttemptID)
            return { attemptId: ex.AttemptID };
        const qCountRes = await (0, database_1.executeQuery)(`SELECT COUNT(*) AS Cnt FROM Questions WHERE CompetitionID=@CompetitionID AND IsActive=1`, { CompetitionID: competitionId });
        const totalQuestions = qCountRes.recordset?.[0]?.Cnt || 0;
        const compRes = await (0, database_1.executeQuery)(`SELECT TimeLimitMinutes FROM Competitions WHERE CompetitionID=@CompetitionID`, { CompetitionID: competitionId });
        const mins = compRes.recordset?.[0]?.TimeLimitMinutes;
        const remaining = mins ? mins * 60 : null;
        const insert = await (0, database_1.executeQuery)(`INSERT INTO QuizAttempts (UserID, CompetitionID, Status, StartTime, RemainingSeconds, CurrentQuestionIndex, TotalQuestions)
       OUTPUT inserted.AttemptID
       VALUES (@UserID, @CompetitionID, 'InProgress', GETUTCDATE(), @RemainingSeconds, 0, @TotalQuestions)`, { UserID: userId, CompetitionID: competitionId, RemainingSeconds: remaining, TotalQuestions: totalQuestions });
        const attemptId = insert.recordset?.[0]?.AttemptID;
        if (!attemptId)
            throw new errorHandler_1.ValidationError('Failed to create quiz attempt');
        return { attemptId };
    }
    async getOngoingAttempts(userId) {
        const res = await (0, database_1.executeQuery)(`SELECT qa.AttemptID, qa.StartTime, qa.RemainingSeconds, qa.CurrentQuestionIndex,
              qa.TotalQuestions,
              (SELECT COUNT(*) FROM QuizAttemptAnswers a WHERE a.AttemptID = qa.AttemptID) AS AnsweredCount,
              (SELECT COUNT(DISTINCT qb.UserID) FROM QuizAttempts qb WHERE qb.CompetitionID = qa.CompetitionID) AS ParticipantsCount,
              c.CompetitionID,
              c.Title AS Title, c.TitleHindi AS TitleHindi,
              c.Description AS Description, c.DescriptionHindi AS DescriptionHindi,
              c.StartDate, c.EndDate, c.TimeLimitMinutes, c.QuestionsPerPage, c.Status
       FROM QuizAttempts qa
       JOIN Competitions c ON c.CompetitionID = qa.CompetitionID
       WHERE qa.UserID=@UserID AND qa.Status='InProgress'
         AND (c.TimeLimitMinutes IS NULL OR c.TimeLimitMinutes = 0)
       ORDER BY qa.StartTime DESC`, { UserID: userId });
        return res.recordset || [];
    }
    async getCompletedAttempts(userId) {
        const res = await (0, database_1.executeQuery)(`SELECT qa.AttemptID, qa.EndTime, qa.CorrectAnswers, qa.TotalQuestions,
              (SELECT COUNT(DISTINCT qb.UserID) FROM QuizAttempts qb WHERE qb.CompetitionID = qa.CompetitionID) AS ParticipantsCount,

	              c.CompetitionID,
              c.Title AS Title, c.TitleHindi AS TitleHindi,
              c.Description AS Description, c.DescriptionHindi AS DescriptionHindi,
              c.StartDate, c.EndDate, c.TimeLimitMinutes,
              c.ResultAnnounceDate,

	              c.QuestionsPerPage, c.Status
	       FROM QuizAttempts qa
	       JOIN Competitions c ON c.CompetitionID = qa.CompetitionID
	       WHERE qa.UserID=@UserID AND qa.Status='Completed'
	       ORDER BY qa.EndTime DESC`, { UserID: userId });
        return res.recordset || [];
    }
    async getUserDashboardStats(userId) {
        const res = await (0, database_1.executeQuery)(`SELECT tc.TotalCompetitions, cc.Completed, avgsc.AverageScore, br.BestRank
	       FROM (SELECT COUNT(*) AS TotalCompetitions FROM Competitions WHERE IsActive=1 AND Status='Published') tc
	       CROSS APPLY (SELECT COUNT(*) AS Completed FROM QuizAttempts WHERE UserID=@UserID AND Status='Completed') cc
	       CROSS APPLY (
	         SELECT COALESCE(AVG(CASE WHEN TotalQuestions>0 THEN (CAST(CorrectAnswers AS float)/NULLIF(TotalQuestions,0))*100 END),0) AS AverageScore
	         FROM QuizAttempts WHERE UserID=@UserID AND Status='Completed'
	       ) avgsc
	       CROSS APPLY (
	         SELECT COALESCE(MIN(rnk), 0) AS BestRank
	         FROM (
	           SELECT qa.UserID,
	                  RANK() OVER (PARTITION BY qa.CompetitionID ORDER BY qa.CorrectAnswers DESC) AS rnk
	           FROM QuizAttempts qa
	           WHERE qa.Status='Completed'
	         ) R
	         WHERE R.UserID=@UserID
	       ) br`, { UserID: userId });
        return res.recordset?.[0] || { TotalCompetitions: 0, Completed: 0, AverageScore: 0, BestRank: 0 };
    }
    async getAttempt(attemptId) {
        const res = await (0, database_1.executeQuery)(`SELECT qa.*, c.Title, c.TitleHindi, c.TimeLimitMinutes
       FROM QuizAttempts qa
       JOIN Competitions c ON c.CompetitionID = qa.CompetitionID
       WHERE qa.AttemptID=@AttemptID`, { AttemptID: attemptId });
        const row = res.recordset?.[0];
        if (!row)
            throw new errorHandler_1.NotFoundError('Attempt not found');
        return row;
    }
    async getAttemptQuestions(attemptId) {
        const res = await (0, database_1.executeQuery)(`SELECT q.QuestionID, q.QuestionText, q.QuestionTextHindi, q.QuestionType, q.QuestionImageURL,
              q.Points, q.TimeLimitSeconds, q.DifficultyLevel, q.OrderIndex,
              a.SelectedOptionIndex, a.AnswerText
       FROM Questions q
       JOIN QuizAttempts qa ON qa.CompetitionID = q.CompetitionID
       LEFT JOIN QuizAttemptAnswers a ON a.AttemptID = qa.AttemptID AND a.QuestionID = q.QuestionID
       WHERE qa.AttemptID=@AttemptID AND q.IsActive=1
       ORDER BY q.OrderIndex ASC`, { AttemptID: attemptId });
        const questions = res.recordset || [];
        const qIds = questions.map((q) => q.QuestionID);
        let optionsByQ = {};
        if (qIds.length) {
            const placeholders = qIds.map((_, i) => `@Q${i}`).join(',');
            const params = {};
            qIds.forEach((id, i) => { params[`Q${i}`] = id; });
            const optsRes = await (0, database_1.executeQuery)(`SELECT OptionID, QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex
         FROM QuestionOptions WHERE QuestionID IN (${placeholders})
         ORDER BY OrderIndex ASC`, params);
            const rows = optsRes.recordset || [];
            for (const r of rows) {
                const key = r.QuestionID;
                if (!optionsByQ[key])
                    optionsByQ[key] = [];
                optionsByQ[key].push(r);
            }
        }
        return questions.map((q) => ({
            QuestionID: q.QuestionID,
            QuestionText: q.QuestionText,
            QuestionTextHindi: q.QuestionTextHindi,
            QuestionType: q.QuestionType,
            QuestionImageURL: q.QuestionImageURL,
            Points: q.Points,
            DifficultyLevel: q.DifficultyLevel,
            OrderIndex: q.OrderIndex,
            SelectedOptionIndex: q.SelectedOptionIndex,
            AnswerText: q.AnswerText,
            Options: optionsByQ[q.QuestionID] || []
        }));
    }
    async saveProgress(attemptId, payload) {
        await (0, database_1.executeQuery)(`UPDATE QuizAttempts SET
         CurrentQuestionIndex = COALESCE(@CurrentIndex, CurrentQuestionIndex),
         RemainingSeconds = COALESCE(@Remaining, RemainingSeconds),
         UpdatedDate = GETUTCDATE()
       WHERE AttemptID=@AttemptID`, { AttemptID: attemptId, CurrentIndex: payload.currentIndex ?? null, Remaining: payload.remainingSeconds ?? null });
        if (payload.answers && payload.answers.length) {
            await (0, database_1.executeQuery)(`DELETE FROM QuizAttemptAnswers WHERE AttemptID=@AttemptID`, { AttemptID: attemptId });
            for (const a of payload.answers) {
                await (0, database_1.executeQuery)(`INSERT INTO QuizAttemptAnswers (AttemptID, QuestionID, SelectedOptionIndex, AnswerText, AnsweredAt)
           VALUES (@AttemptID, @QuestionID, @SelectedOptionIndex, @AnswerText, GETUTCDATE())`, { AttemptID: attemptId, QuestionID: a.questionId, SelectedOptionIndex: a.selectedOptionIndex ?? null, AnswerText: a.answerText || null });
            }
        }
    }
    async submitAttempt(attemptId) {
        const answersRes = await (0, database_1.executeQuery)(`SELECT a.QuestionID, a.SelectedOptionIndex, q.QuestionType
       FROM QuizAttemptAnswers a
       JOIN Questions q ON q.QuestionID = a.QuestionID
       WHERE a.AttemptID=@AttemptID`, { AttemptID: attemptId });
        const answers = answersRes.recordset || [];
        let correct = 0;
        for (const a of answers) {
            if (a.QuestionType === 'MCQ' && a.SelectedOptionIndex !== null && a.SelectedOptionIndex !== undefined) {
                const optRes = await (0, database_1.executeQuery)(`SELECT IsCorrect FROM QuestionOptions WHERE QuestionID=@QuestionID AND OrderIndex=@OrderIndex`, { QuestionID: a.QuestionID, OrderIndex: a.SelectedOptionIndex });
                const row = optRes.recordset?.[0];
                if (row?.IsCorrect)
                    correct++;
            }
        }
        await (0, database_1.executeQuery)(`UPDATE QuizAttempts SET Status='Completed', EndTime=GETUTCDATE(), CorrectAnswers=@Correct WHERE AttemptID=@AttemptID`, { AttemptID: attemptId, Correct: correct });
        return { correct };
    }
    async getActiveCompetitionsForUser(userId) {
        const res = await (0, database_1.executeQuery)(`SELECT c.*,
              (SELECT COUNT(*) FROM Questions q WHERE q.CompetitionID=c.CompetitionID AND q.IsActive=1) AS TotalQuestions,
              (SELECT COUNT(DISTINCT qa.UserID) FROM QuizAttempts qa WHERE qa.CompetitionID=c.CompetitionID) AS ParticipantsCount
       FROM Competitions c
       WHERE c.Status='Published'
         AND c.IsActive=1
         AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()
         AND NOT EXISTS (
           SELECT 1 FROM QuizAttempts qa
           WHERE qa.UserID=@UserID AND qa.CompetitionID=c.CompetitionID AND qa.Status IN ('InProgress','Completed')
         )
       ORDER BY c.StartDate DESC`, { UserID: userId });
        return res.recordset || [];
    }
    async getAttemptResultSummary(userId, attemptId) {
        const res = await (0, database_1.executeQuery)(`SELECT qa.AttemptID, qa.UserID, qa.TotalQuestions, qa.CorrectAnswers, qa.EndTime,
              c.Title, c.TitleHindi
       FROM QuizAttempts qa
       JOIN Competitions c ON c.CompetitionID = qa.CompetitionID
       WHERE qa.AttemptID=@AttemptID AND qa.UserID=@UserID AND qa.Status='Completed'`, { AttemptID: attemptId, UserID: userId });
        const row = res.recordset?.[0];
        if (!row)
            throw new errorHandler_1.NotFoundError('Result not found');
        const Score = row.CorrectAnswers ?? null;
        return { ...row, Score };
    }
    async getUpcomingCompetitionsForUser(userId) {
        const res = await (0, database_1.executeQuery)(`SELECT c.*,
              (SELECT COUNT(*) FROM Questions q WHERE q.CompetitionID=c.CompetitionID AND q.IsActive=1) AS TotalQuestions,
              (SELECT COUNT(DISTINCT qa.UserID) FROM QuizAttempts qa WHERE qa.CompetitionID=c.CompetitionID) AS ParticipantsCount
       FROM Competitions c
       WHERE c.Status IN ('Draft','Published') AND c.IsActive=1 AND c.StartDate > GETUTCDATE()
       ORDER BY c.StartDate ASC`, { UserID: userId });
        return res.recordset || [];
    }
}
exports.QuizService = QuizService;
exports.quizService = new QuizService();
//# sourceMappingURL=quizService.js.map