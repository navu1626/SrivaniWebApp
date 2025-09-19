"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitionService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class CompetitionService {
    async copyCompetition(adminUserId, sourceCompetitionId) {
        const comp = await this.getCompetitionById(sourceCompetitionId);
        const insertSql = `
      INSERT INTO Competitions (
        Title, TitleHindi, Description, DescriptionHindi, BannerImageURL,
        StartDate, EndDate, RegistrationStartDate, RegistrationEndDate,
        HasTimeLimit, TimeLimitMinutes, MaxParticipants, QuestionsPerPage,
        AllowedQuestionTypes, DifficultyLevel, Status, CreatedBy
      )
      OUTPUT inserted.CompetitionID
      VALUES (
        @Title, @TitleHindi, @Description, @DescriptionHi, @BannerImageURL,
        @StartDate, @EndDate, NULL, NULL,
        @HasTimeLimit, @TimeLimitMinutes, @MaxParticipants, @QuestionsPerPage,
        @AllowedQuestionTypes, @DifficultyLevel, 'Draft', @CreatedBy
      )`;
        const compRes = await (0, database_1.executeQuery)(insertSql, {
            Title: comp.Title,
            TitleHindi: comp.TitleHindi,
            Description: comp.Description,
            DescriptionHi: comp.DescriptionHindi,
            BannerImageURL: comp.BannerImageURL,
            StartDate: comp.StartDate,
            EndDate: comp.EndDate,
            HasTimeLimit: comp.HasTimeLimit,
            TimeLimitMinutes: comp.TimeLimitMinutes,
            MaxParticipants: comp.MaxParticipants ?? null,
            QuestionsPerPage: comp.QuestionsPerPage,
            AllowedQuestionTypes: comp.AllowedQuestionTypes,
            DifficultyLevel: comp.DifficultyLevel,
            CreatedBy: adminUserId,
        });
        const newCompetitionId = compRes.recordset?.[0]?.CompetitionID;
        const questionsRes = await (0, database_1.executeQuery)(`SELECT * FROM Questions WHERE CompetitionID=@CompetitionID AND IsActive=1 ORDER BY OrderIndex ASC`, { CompetitionID: sourceCompetitionId });
        const questions = questionsRes.recordset || [];
        for (let idx = 0; idx < questions.length; idx++) {
            const q = questions[idx];
            const insertQ = `
        INSERT INTO Questions (
          CompetitionID, QuestionText, QuestionTextHindi, QuestionType,
          QuestionImageURL, Points, TimeLimitSeconds, DifficultyLevel, OrderIndex, IsActive, CreatedBy
        )
        OUTPUT inserted.QuestionID
        VALUES (
          @CompetitionID, @QuestionText, @QuestionTextHindi, @QuestionType,
          @QuestionImageURL, @Points, @TimeLimitSeconds, @QDifficultyLevel, @OrderIndex, 1, @CreatedBy
        )`;
            const qRes = await (0, database_1.executeQuery)(insertQ, {
                CompetitionID: newCompetitionId,
                QuestionText: q.QuestionText,
                QuestionTextHindi: q.QuestionTextHindi,
                QuestionType: q.QuestionType,
                QuestionImageURL: q.QuestionImageURL,
                Points: q.Points,
                TimeLimitSeconds: q.TimeLimitSeconds,
                QDifficultyLevel: q.DifficultyLevel,
                OrderIndex: idx + 1,
                CreatedBy: adminUserId,
            });
            const newQId = qRes.recordset?.[0]?.QuestionID;
            const optsRes = await (0, database_1.executeQuery)(`SELECT * FROM QuestionOptions WHERE QuestionID=@QuestionID ORDER BY OrderIndex ASC`, { QuestionID: q.QuestionID });
            const opts = optsRes.recordset || [];
            for (let i = 0; i < opts.length; i++) {
                const o = opts[i];
                await (0, database_1.executeQuery)(`INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
           VALUES (@QuestionID, @OptionText, @OptionTextHindi, @OptionImageURL, @IsCorrect, @OrderIndex)`, {
                    QuestionID: newQId,
                    OptionText: o.OptionText,
                    OptionTextHindi: o.OptionTextHindi,
                    OptionImageURL: o.OptionImageURL,
                    IsCorrect: o.IsCorrect,
                    OrderIndex: o.OrderIndex,
                });
            }
        }
        return newCompetitionId;
    }
    async createCompetition(adminUserId, payload) {
        try {
            console.log('=== CREATE COMPETITION DEBUG ===');
            console.log('Payload received:', JSON.stringify(payload, null, 2));
            if (payload.questions) {
                console.log('Questions count:', payload.questions.length);
                payload.questions.forEach((q, i) => {
                    console.log(`Question ${i}:`, {
                        type: q.type,
                        question: q.question?.substring(0, 50) + '...',
                        hasOptions: !!q.options,
                        optionsCount: q.options?.length,
                        correctAnswer: q.correctAnswer
                    });
                });
            }
            const start = new Date(payload.startDate);
            const end = new Date(payload.endDate);
            if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
                throw new errorHandler_1.ValidationError('Invalid start or end date');
            }
            if (end <= start) {
                throw new errorHandler_1.ValidationError('End date must be after start date');
            }
            const questionsPerPage = payload.questionsPerPage ?? 1;
            const hasTimeLimit = !!payload.hasTimeLimit;
            const timeLimitMinutes = hasTimeLimit ? (payload.timeLimitMinutes ?? null) : null;
            const allowedQuestionTypes = payload.allowedQuestionTypes || 'MCQ,Descriptive';
            const difficultyLevel = payload.difficultyLevel || 'Medium';
            const status = payload.status || 'Draft';
            const insertCompetitionSql = `
        INSERT INTO Competitions (
          Title, TitleHindi, Description, DescriptionHindi, BannerImageURL,
          StartDate, EndDate, RegistrationStartDate, RegistrationEndDate,
          HasTimeLimit, TimeLimitMinutes, MaxParticipants, QuestionsPerPage,
          AllowedQuestionTypes, DifficultyLevel, Status, CreatedBy
        )
        OUTPUT inserted.CompetitionID
        VALUES (
          @Title, @TitleHindi, @Description, @DescriptionHindi, @BannerImageURL,
          @StartDate, @EndDate, NULL, NULL,
          @HasTimeLimit, @TimeLimitMinutes, @MaxParticipants, @QuestionsPerPage,
          @AllowedQuestionTypes, @DifficultyLevel, @Status, @CreatedBy
        )`;
            const compResult = await (0, database_1.executeQuery)(insertCompetitionSql, {
                Title: payload.title,
                TitleHindi: payload.titleHi || null,
                Description: payload.description,
                DescriptionHindi: payload.descriptionHi || null,
                BannerImageURL: payload.bannerImageUrl || null,
                StartDate: start,
                EndDate: end,
                HasTimeLimit: hasTimeLimit ? 1 : 0,
                TimeLimitMinutes: timeLimitMinutes,
                MaxParticipants: payload.maxParticipants ?? null,
                QuestionsPerPage: questionsPerPage,
                AllowedQuestionTypes: allowedQuestionTypes,
                DifficultyLevel: difficultyLevel,
                Status: status,
                CreatedBy: adminUserId,
            });
            const competitionId = compResult.recordset?.[0]?.CompetitionID;
            if (!competitionId) {
                throw new errorHandler_1.DatabaseError('Failed to create competition');
            }
            if (payload.questions && payload.questions.length) {
                let order = 1;
                for (const q of payload.questions) {
                    const insertQuestionSql = `
            INSERT INTO Questions (
              CompetitionID, QuestionText, QuestionTextHindi, QuestionType,
              QuestionImageURL, Points, TimeLimitSeconds, DifficultyLevel, OrderIndex, IsActive, CreatedBy
            )
            OUTPUT inserted.QuestionID
            VALUES (
              @CompetitionID, @QuestionText, @QuestionTextHindi, @QuestionType,
              @QuestionImageURL, @Points, @TimeLimitSeconds, @QDifficultyLevel, @OrderIndex, 1, @CreatedBy
            )`;
                    const qResult = await (0, database_1.executeQuery)(insertQuestionSql, {
                        CompetitionID: competitionId,
                        QuestionText: q.question,
                        QuestionTextHindi: q.questionHi || null,
                        QuestionType: q.type === 'mcq' ? 'MCQ' : 'Descriptive',
                        QuestionImageURL: q.imageUrl || null,
                        Points: q.points ?? 1,
                        TimeLimitSeconds: q.timeLimit ?? null,
                        QDifficultyLevel: difficultyLevel,
                        OrderIndex: order++,
                        CreatedBy: adminUserId,
                    });
                    const questionId = qResult.recordset?.[0]?.QuestionID;
                    if (!questionId) {
                        throw new errorHandler_1.DatabaseError('Failed to insert question');
                    }
                    if (q.type === 'mcq' && q.options && q.options.length) {
                        for (let i = 0; i < q.options.length; i++) {
                            const optText = q.options[i];
                            const optHi = q.optionsHi && q.optionsHi[i] ? q.optionsHi[i] : null;
                            const isCorrect = q.correctAnswer === i ? 1 : 0;
                            const insertOptionSql = `
                INSERT INTO QuestionOptions (
                  QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex
                )
                VALUES (
                  @QuestionID, @OptionText, @OptionTextHindi, NULL, @IsCorrect, @OrderIndex
                )`;
                            await (0, database_1.executeQuery)(insertOptionSql, {
                                QuestionID: questionId,
                                OptionText: optText,
                                OptionTextHindi: optHi,
                                IsCorrect: isCorrect,
                                OrderIndex: i + 1,
                            });
                        }
                    }
                }
            }
            return { competitionId };
        }
        catch (error) {
            if (error instanceof errorHandler_1.ValidationError)
                throw error;
            throw new errorHandler_1.DatabaseError('Failed to create competition');
        }
    }
    async getAllCompetitions(page, limit, status) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'c.IsActive = 1';
            const params = { offset, limit };
            if (status) {
                if (status === 'Active') {
                    whereClause += ' AND c.Status = @status AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()';
                    params.status = 'Published';
                }
                else if (status === 'Upcoming') {
                    whereClause += ' AND c.Status = @status AND c.StartDate > GETUTCDATE()';
                    params.status = 'Published';
                }
                else if (status === 'Completed') {
                    whereClause += ' AND (c.Status = @status OR c.EndDate < GETUTCDATE())';
                    params.status = 'Completed';
                }
                else {
                    whereClause += ' AND c.Status = @status';
                    params.status = status;
                }
            }
            const countSql = `SELECT COUNT(*) AS total FROM Competitions c WHERE ${whereClause}`;
            const countRes = await (0, database_1.executeQuery)(countSql, params);
            const total = countRes.recordset?.[0]?.total || 0;
            const sql = `
        SELECT c.CompetitionID, c.Title, c.TitleHindi, c.Description, c.DescriptionHindi, c.BannerImageURL,
               c.StartDate, c.EndDate, c.DifficultyLevel, c.Status, c.QuestionsPerPage, c.CreatedDate,
               c.HasTimeLimit, c.TimeLimitMinutes, c.AllowedQuestionTypes, c.ResultAnnounceDate,
               (SELECT COUNT(*) FROM Questions q WHERE q.CompetitionID = c.CompetitionID AND q.IsActive = 1) AS TotalQuestions,
               (SELECT COUNT(DISTINCT qa.UserID) FROM QuizAttempts qa WHERE qa.CompetitionID = c.CompetitionID) AS ParticipantsCount
        FROM Competitions c
        WHERE ${whereClause}
        ORDER BY c.CreatedDate DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
            const res = await (0, database_1.executeQuery)(sql, params);
            const items = res.recordset || [];
            const totalPages = Math.ceil(total / limit) || 1;
            return { items, total, page, limit, totalPages };
        }
        catch (e) {
            throw new errorHandler_1.DatabaseError('Failed to load competitions');
        }
    }
    async getCompetitionById(competitionId) {
        const sql = `SELECT CompetitionID, Title, TitleHindi, Description, DescriptionHindi, BannerImageURL,
                        StartDate, EndDate, DifficultyLevel, Status, QuestionsPerPage, CreatedDate,
                        HasTimeLimit, TimeLimitMinutes, AllowedQuestionTypes
                 FROM Competitions WHERE CompetitionID = @CompetitionID`;
        const res = await (0, database_1.executeQuery)(sql, { CompetitionID: competitionId });
        const item = res.recordset?.[0];
        if (!item)
            throw new errorHandler_1.NotFoundError('Competition not found');
        return item;
    }
    async updateCompetition(adminUserId, competitionId, data) {
        console.log('=== UPDATE COMPETITION DEBUG ===');
        console.log('Competition ID:', competitionId);
        console.log('Update data received:', JSON.stringify(data, null, 2));
        if (data.questions) {
            console.log('Questions count:', data.questions.length);
            data.questions.forEach((q, i) => {
                console.log(`Question ${i}:`, {
                    id: q.id,
                    type: q.type,
                    question: q.question?.substring(0, 50) + '...',
                    hasOptions: !!q.options,
                    optionsCount: q.options?.length,
                    correctAnswer: q.correctAnswer
                });
            });
        }
        const fields = [];
        const params = { CompetitionID: competitionId, UpdatedBy: adminUserId };
        const mapping = {
            title: 'Title',
            titleHi: 'TitleHindi',
            description: 'Description',
            descriptionHi: 'DescriptionHindi',
            bannerImageUrl: 'BannerImageURL',
            startDate: 'StartDate',
            endDate: 'EndDate',
            hasTimeLimit: 'HasTimeLimit',
            timeLimitMinutes: 'TimeLimitMinutes',
            difficultyLevel: 'DifficultyLevel',
            status: 'Status',
            questionsPerPage: 'QuestionsPerPage',
            allowedQuestionTypes: 'AllowedQuestionTypes'
        };
        for (const k of Object.keys(mapping)) {
            const dbField = mapping[k];
            if (!dbField)
                continue;
            const value = data[k];
            if (typeof value !== 'undefined') {
                fields.push(`${dbField} = @${dbField}`);
                let processedValue = value;
                if (k === 'hasTimeLimit') {
                    processedValue = value ? 1 : 0;
                }
                else if (k === 'startDate' || k === 'endDate') {
                    processedValue = new Date(value);
                }
                params[dbField] = processedValue;
            }
        }
        if (!fields.length && !(data.questions && data.questions.length))
            return this.getCompetitionById(competitionId);
        if (fields.length) {
            const sql = `UPDATE Competitions SET ${fields.join(', ')}, UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy WHERE CompetitionID = @CompetitionID`;
            await (0, database_1.executeQuery)(sql, params);
        }
        if (data.questions && Array.isArray(data.questions)) {
            const existingRes = await (0, database_1.executeQuery)(`SELECT QuestionID FROM Questions WHERE CompetitionID = @CompetitionID AND IsActive = 1 ORDER BY OrderIndex ASC`, { CompetitionID: competitionId });
            const existingIds = (existingRes.recordset || []).map((r) => String(r.QuestionID));
            const providedIds = [];
            let order = 1;
            for (const q of data.questions) {
                console.log('Processing question for update:', {
                    id: q.id,
                    type: q.type,
                    question: q.question?.substring(0, 50) + '...',
                    hasOptions: !!q.options,
                    optionsCount: q.options?.length,
                    correctAnswer: q.correctAnswer
                });
                const typeDb = q.type === 'mcq' ? 'MCQ' : 'Descriptive';
                const imgUrl = q.image || q.imageUrl || null;
                const points = q.points ?? 1;
                const timeLimit = q.timeLimit ?? null;
                const level = data.difficultyLevel || 'Medium';
                console.log('Mapped values:', { typeDb, imgUrl, points, timeLimit, level });
                if (q.id && existingIds.includes(String(q.id))) {
                    providedIds.push(String(q.id));
                    await (0, database_1.executeQuery)(`UPDATE Questions SET
               QuestionText = @QuestionText,
               QuestionTextHindi = @QuestionTextHindi,
               QuestionType = @QuestionType,
               QuestionImageURL = @QuestionImageURL,
               Points = @Points,
               TimeLimitSeconds = @TimeLimitSeconds,
               DifficultyLevel = @QDifficultyLevel,
               OrderIndex = @OrderIndex,
               UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy
             WHERE QuestionID = @QuestionID AND CompetitionID = @CompetitionID`, {
                        QuestionID: q.id,
                        CompetitionID: competitionId,
                        QuestionText: q.question,
                        QuestionTextHindi: q.questionHi || null,
                        QuestionType: typeDb,
                        QuestionImageURL: imgUrl,
                        Points: points,
                        TimeLimitSeconds: timeLimit,
                        QDifficultyLevel: level,
                        OrderIndex: order++,
                        UpdatedBy: adminUserId,
                    });
                    await (0, database_1.executeQuery)(`DELETE FROM QuestionOptions WHERE QuestionID = @QuestionID`, { QuestionID: q.id });
                    if (q.type === 'mcq' && q.options) {
                        for (let i = 0; i < q.options.length; i++) {
                            const optText = q.options[i];
                            const optHi = q.optionsHi && q.optionsHi[i] ? q.optionsHi[i] : null;
                            const isCorrect = q.correctAnswer === i ? 1 : 0;
                            await (0, database_1.executeQuery)(`INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
                 VALUES (@QuestionID, @OptionText, @OptionTextHindi, NULL, @IsCorrect, @OrderIndex)`, { QuestionID: q.id, OptionText: optText, OptionTextHindi: optHi, IsCorrect: isCorrect, OrderIndex: i + 1 });
                        }
                    }
                }
                else {
                    const insertQuestionSql = `
            INSERT INTO Questions (
              CompetitionID, QuestionText, QuestionTextHindi, QuestionType,
              QuestionImageURL, Points, TimeLimitSeconds, DifficultyLevel, OrderIndex, IsActive, CreatedBy
            )
            OUTPUT inserted.QuestionID
            VALUES (
              @CompetitionID, @QuestionText, @QuestionTextHindi, @QuestionType,
              @QuestionImageURL, @Points, @TimeLimitSeconds, @QDifficultyLevel, @OrderIndex, 1, @CreatedBy
            )`;
                    const qResult = await (0, database_1.executeQuery)(insertQuestionSql, {
                        CompetitionID: competitionId,
                        QuestionText: q.question,
                        QuestionTextHindi: q.questionHi || null,
                        QuestionType: typeDb,
                        QuestionImageURL: imgUrl,
                        Points: points,
                        TimeLimitSeconds: timeLimit,
                        QDifficultyLevel: level,
                        OrderIndex: order++,
                        CreatedBy: adminUserId,
                    });
                    const questionId = qResult.recordset?.[0]?.QuestionID;
                    providedIds.push(String(questionId));
                    if (q.type === 'mcq' && q.options) {
                        for (let i = 0; i < q.options.length; i++) {
                            const optText = q.options[i];
                            const optHi = q.optionsHi && q.optionsHi[i] ? q.optionsHi[i] : null;
                            const isCorrect = q.correctAnswer === i ? 1 : 0;
                            await (0, database_1.executeQuery)(`INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
                 VALUES (@QuestionID, @OptionText, @OptionTextHindi, NULL, @IsCorrect, @OrderIndex)`, { QuestionID: questionId, OptionText: optText, OptionTextHindi: optHi, IsCorrect: isCorrect, OrderIndex: i + 1 });
                        }
                    }
                }
            }
            const toDelete = existingIds.filter((id) => !providedIds.includes(String(id)));
            if (toDelete.length) {
                const placeholders = toDelete.map((_, i) => `@Q${i}`).join(',');
                const params = { CompetitionID: competitionId, UpdatedBy: adminUserId };
                toDelete.forEach((id, i) => (params[`Q${i}`] = id));
                await (0, database_1.executeQuery)(`UPDATE Questions SET IsActive = 0, UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy
           WHERE CompetitionID = @CompetitionID AND QuestionID IN (${placeholders})`, params);
                for (const id of toDelete) {
                    await (0, database_1.executeQuery)(`DELETE FROM QuestionOptions WHERE QuestionID = @QuestionID`, { QuestionID: id });
                }
            }
        }
        return this.getCompetitionById(competitionId);
    }
    async deleteCompetition(competitionId) {
        const sql = `UPDATE Competitions SET IsActive = 0, UpdatedDate = GETUTCDATE() WHERE CompetitionID = @CompetitionID`;
        await (0, database_1.executeQuery)(sql, { CompetitionID: competitionId });
    }
    async publishCompetition(adminUserId, competitionId) {
        console.log('=== PUBLISH COMPETITION DEBUG ===');
        console.log('Admin User ID:', adminUserId);
        console.log('Competition ID:', competitionId);
        const sql = `UPDATE Competitions SET Status = 'Published', UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy WHERE CompetitionID = @CompetitionID`;
        const result = await (0, database_1.executeQuery)(sql, { CompetitionID: competitionId, UpdatedBy: adminUserId });
        console.log('Publish result:', result);
    }
    async declareResult(adminUserId, competitionId, when) {
        const sql = `UPDATE Competitions SET ResultAnnounceDate=@When, UpdatedDate=GETUTCDATE(), UpdatedBy=@UpdatedBy WHERE CompetitionID=@CompetitionID`;
        await (0, database_1.executeQuery)(sql, { When: when, UpdatedBy: adminUserId, CompetitionID: competitionId });
    }
    async getCompetitionQuestions(competitionId) {
        try {
            const questionsSql = `
        SELECT q.QuestionID, q.QuestionText, q.QuestionTextHindi, q.QuestionType,
               q.QuestionImageURL, q.Points, q.TimeLimitSeconds, q.OrderIndex
        FROM Questions q
        WHERE q.CompetitionID = @CompetitionID AND q.IsActive = 1
        ORDER BY q.OrderIndex ASC`;
            const questionsRes = await (0, database_1.executeQuery)(questionsSql, { CompetitionID: competitionId });
            const questions = questionsRes.recordset || [];
            for (const question of questions) {
                if (question.QuestionType === 'MCQ') {
                    const optionsSql = `
            SELECT OptionText, OptionTextHindi, IsCorrect, OrderIndex
            FROM QuestionOptions
            WHERE QuestionID = @QuestionID
            ORDER BY OrderIndex ASC`;
                    const optionsRes = await (0, database_1.executeQuery)(optionsSql, { QuestionID: question.QuestionID });
                    const options = optionsRes.recordset || [];
                    console.log(`Options for question ${question.QuestionID}:`, options);
                    question.options = options.map((opt) => opt.OptionText);
                    question.optionsHi = options.map((opt) => opt.OptionTextHindi || null);
                    question.correctAnswer = options.findIndex((opt) => {
                        const isCorrect = opt.IsCorrect;
                        return isCorrect === true || isCorrect === 1 || isCorrect === '1';
                    });
                    console.log(`Correct answer index for question ${question.QuestionID}:`, question.correctAnswer);
                }
            }
            const mappedQuestions = questions.map((q) => {
                const mapped = {
                    id: q.QuestionID,
                    type: q.QuestionType.toLowerCase(),
                    question: q.QuestionText || '',
                    questionHi: q.QuestionTextHindi || '',
                    options: q.options || [],
                    optionsHi: q.optionsHi || [],
                    correctAnswer: q.correctAnswer >= 0 ? q.correctAnswer : undefined,
                    points: q.Points || 1,
                    timeLimit: q.TimeLimitSeconds || undefined,
                    image: q.QuestionImageURL || undefined
                };
                console.log('Mapped question for frontend:', mapped);
                return mapped;
            });
            console.log('Final questions being returned:', mappedQuestions);
            return mappedQuestions;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to fetch competition questions');
        }
    }
}
exports.competitionService = new CompetitionService();
//# sourceMappingURL=competitionService.js.map