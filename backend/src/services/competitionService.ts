import { executeQuery } from '../config/database';
import { NotFoundError, DatabaseError, ValidationError } from '../middleware/errorHandler';

export type CreateCompetitionPayload = {
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  bannerImageUrl?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  hasTimeLimit?: boolean;
  timeLimitMinutes?: number;
  maxParticipants?: number;
  questionsPerPage?: 1 | 5 | 10 | 20;
  allowedQuestionTypes?: string; // e.g., "MCQ,Descriptive"
  difficultyLevel?: 'Easy' | 'Medium' | 'Hard';
  status?: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
  questions?: Array<{
    type: 'mcq' | 'descriptive';
    question: string;
    questionHi?: string;
    options?: string[]; // for mcq
    optionsHi?: string[]; // optional Hindi options
    correctAnswer?: number; // index in options
    points?: number;
    timeLimit?: number; // seconds
    imageUrl?: string;
  }>;
};

class CompetitionService {
  async copyCompetition(adminUserId: string, sourceCompetitionId: string): Promise<string> {
    // Duplicate competition row with Status='Draft' and duplicate active questions and their options
    // 1) Get source competition
    const comp = await this.getCompetitionById(sourceCompetitionId);

    // 2) Insert new competition based on comp
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

    const compRes = await executeQuery<{ CompetitionID: string }>(insertSql, {
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

    const newCompetitionId = (compRes as any).recordset?.[0]?.CompetitionID;

    // 3) Copy questions
    const questionsRes = await executeQuery<any>(
      `SELECT * FROM Questions WHERE CompetitionID=@CompetitionID AND IsActive=1 ORDER BY OrderIndex ASC`,
      { CompetitionID: sourceCompetitionId }
    );
    const questions = (questionsRes as any).recordset || [];

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
      const qRes = await executeQuery<{ QuestionID: string }>(insertQ, {
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
      const newQId = (qRes as any).recordset?.[0]?.QuestionID;

      const optsRes = await executeQuery<any>(
        `SELECT * FROM QuestionOptions WHERE QuestionID=@QuestionID ORDER BY OrderIndex ASC`,
        { QuestionID: q.QuestionID }
      );
      const opts = (optsRes as any).recordset || [];
      for (let i = 0; i < opts.length; i++) {
        const o = opts[i];
        await executeQuery(
          `INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
           VALUES (@QuestionID, @OptionText, @OptionTextHindi, @OptionImageURL, @IsCorrect, @OrderIndex)`,
          {
            QuestionID: newQId,
            OptionText: o.OptionText,
            OptionTextHindi: o.OptionTextHindi,
            OptionImageURL: o.OptionImageURL,
            IsCorrect: o.IsCorrect,
            OrderIndex: o.OrderIndex,
          }
        );
      }
    }

    return newCompetitionId;
  }

  async createCompetition(adminUserId: string, payload: CreateCompetitionPayload): Promise<{ competitionId: string }> {
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
        throw new ValidationError('Invalid start or end date');
      }
      if (end <= start) {
        throw new ValidationError('End date must be after start date');
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

      const compResult = await executeQuery<{ CompetitionID: string }>(insertCompetitionSql, {
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

      const competitionId = (compResult as any).recordset?.[0]?.CompetitionID;
      if (!competitionId) {
        throw new DatabaseError('Failed to create competition');
      }

      // Insert questions if provided
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

          const qResult = await executeQuery<{ QuestionID: string }>(insertQuestionSql, {
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

          const questionId = (qResult as any).recordset?.[0]?.QuestionID;
          if (!questionId) {
            throw new DatabaseError('Failed to insert question');
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

              await executeQuery(insertOptionSql, {
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
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to create competition');
    }
  }


  async getAllCompetitions(page: number, limit: number, status?: string): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number; }> {

    try {
      const offset = (page - 1) * limit;

      // Build WHERE clause based on status
      let whereClause = 'c.IsActive = 1';
      const params: any = { offset, limit };

      if (status) {
        if (status === 'Active') {
          whereClause += ' AND c.Status = @status AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()';
          params.status = 'Published';
        } else if (status === 'Upcoming') {
          whereClause += ' AND c.Status = @status AND c.StartDate > GETUTCDATE()';
          params.status = 'Published';
        } else if (status === 'Completed') {
          whereClause += ' AND (c.Status = @status OR c.EndDate < GETUTCDATE())';
          params.status = 'Completed';
        } else {
          whereClause += ' AND c.Status = @status';
          params.status = status;
        }
      }

      const countSql = `SELECT COUNT(*) AS total FROM Competitions c WHERE ${whereClause}`;
      const countRes = await executeQuery<{ total: number }>(countSql, params);
      const total = (countRes as any).recordset?.[0]?.total || 0;

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
      const res = await executeQuery<any>(sql, params);
      const items = (res as any).recordset || [];
      const totalPages = Math.ceil(total / limit) || 1;
      return { items, total, page, limit, totalPages };
    } catch (e) {
      throw new DatabaseError('Failed to load competitions');
    }
  }

  async getCompetitionById(competitionId: string): Promise<any> {
    const sql = `SELECT CompetitionID, Title, TitleHindi, Description, DescriptionHindi, BannerImageURL,
                        StartDate, EndDate, DifficultyLevel, Status, QuestionsPerPage, CreatedDate,
                        HasTimeLimit, TimeLimitMinutes, AllowedQuestionTypes
                 FROM Competitions WHERE CompetitionID = @CompetitionID`;
    const res = await executeQuery<any>(sql, { CompetitionID: competitionId });
    const item = (res as any).recordset?.[0];
    if (!item) throw new NotFoundError('Competition not found');
    return item;
  }

  async updateCompetition(adminUserId: string, competitionId: string, data: any): Promise<any> {
    console.log('=== UPDATE COMPETITION DEBUG ===');
    console.log('Competition ID:', competitionId);
    console.log('Update data received:', JSON.stringify(data, null, 2));
    if (data.questions) {
      console.log('Questions count:', data.questions.length);
      data.questions.forEach((q: any, i: number) => {
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
    const fields: string[] = [];
    const params: Record<string, any> = { CompetitionID: competitionId, UpdatedBy: adminUserId };

    const mapping: Record<string, string> = {
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
      const dbField = (mapping as Record<string, string>)[k] as string;
      if (!dbField) continue;
      const value = (data as any)[k];
      if (typeof value !== 'undefined') {
        fields.push(`${dbField} = @${dbField}`);

        // Handle special field types
        let processedValue = value;
        if (k === 'hasTimeLimit') {
          processedValue = value ? 1 : 0; // Convert boolean to bit
        } else if (k === 'startDate' || k === 'endDate') {
          processedValue = new Date(value); // Ensure proper date format
        }

        (params as Record<string, any>)[dbField] = processedValue;
      }
    }

    if (!fields.length && !(data.questions && data.questions.length)) return this.getCompetitionById(competitionId);

    // Update competition fields
    if (fields.length) {
      const sql = `UPDATE Competitions SET ${fields.join(', ')}, UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy WHERE CompetitionID = @CompetitionID`;
      await executeQuery(sql, params);
    }

    // If questions provided, upsert to avoid duplicates
    if (data.questions && Array.isArray(data.questions)) {
      // Load existing questions for this competition
      const existingRes = await executeQuery<any>(
        `SELECT QuestionID FROM Questions WHERE CompetitionID = @CompetitionID AND IsActive = 1 ORDER BY OrderIndex ASC`,
        { CompetitionID: competitionId }
      );
      const existingIds: string[] = ((existingRes as any).recordset || []).map((r: any) => String(r.QuestionID));

      const providedIds: string[] = [];
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
          // Update existing
          providedIds.push(String(q.id));
          await executeQuery(
            `UPDATE Questions SET
               QuestionText = @QuestionText,
               QuestionTextHindi = @QuestionTextHindi,
               QuestionType = @QuestionType,
               QuestionImageURL = @QuestionImageURL,
               Points = @Points,
               TimeLimitSeconds = @TimeLimitSeconds,
               DifficultyLevel = @QDifficultyLevel,
               OrderIndex = @OrderIndex,
               UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy
             WHERE QuestionID = @QuestionID AND CompetitionID = @CompetitionID`,
            {
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
            }
          );

          // Replace options
          await executeQuery(`DELETE FROM QuestionOptions WHERE QuestionID = @QuestionID`, { QuestionID: q.id });
          if (q.type === 'mcq' && q.options) {
            for (let i = 0; i < q.options.length; i++) {
              const optText = q.options[i];
              const optHi = q.optionsHi && q.optionsHi[i] ? q.optionsHi[i] : null;
              const isCorrect = q.correctAnswer === i ? 1 : 0;
              await executeQuery(
                `INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
                 VALUES (@QuestionID, @OptionText, @OptionTextHindi, NULL, @IsCorrect, @OrderIndex)`,
                { QuestionID: q.id, OptionText: optText, OptionTextHindi: optHi, IsCorrect: isCorrect, OrderIndex: i + 1 }
              );
            }
          }
        } else {
          // Insert new
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

          const qResult = await executeQuery<{ QuestionID: string }>(insertQuestionSql, {
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

          const questionId = (qResult as any).recordset?.[0]?.QuestionID;
          providedIds.push(String(questionId));

          if (q.type === 'mcq' && q.options) {
            for (let i = 0; i < q.options.length; i++) {
              const optText = q.options[i];
              const optHi = q.optionsHi && q.optionsHi[i] ? q.optionsHi[i] : null;
              const isCorrect = q.correctAnswer === i ? 1 : 0;
              await executeQuery(
                `INSERT INTO QuestionOptions (QuestionID, OptionText, OptionTextHindi, OptionImageURL, IsCorrect, OrderIndex)
                 VALUES (@QuestionID, @OptionText, @OptionTextHindi, NULL, @IsCorrect, @OrderIndex)`,
                { QuestionID: questionId, OptionText: optText, OptionTextHindi: optHi, IsCorrect: isCorrect, OrderIndex: i + 1 }
              );
            }
          }
        }
      }

      // Soft-delete questions that were not provided
      const toDelete = existingIds.filter((id) => !providedIds.includes(String(id)));
      if (toDelete.length) {
        const placeholders = toDelete.map((_, i) => `@Q${i}`).join(',');
        const params: any = { CompetitionID: competitionId, UpdatedBy: adminUserId };
        toDelete.forEach((id, i) => (params[`Q${i}`] = id));
        await executeQuery(
          `UPDATE Questions SET IsActive = 0, UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy
           WHERE CompetitionID = @CompetitionID AND QuestionID IN (${placeholders})`,
          params
        );
        // Delete options for soft-deleted questions
        for (const id of toDelete) {
          await executeQuery(`DELETE FROM QuestionOptions WHERE QuestionID = @QuestionID`, { QuestionID: id });
        }
      }
    }

    return this.getCompetitionById(competitionId);
  }

  async deleteCompetition(competitionId: string): Promise<void> {
    const sql = `UPDATE Competitions SET IsActive = 0, UpdatedDate = GETUTCDATE() WHERE CompetitionID = @CompetitionID`;
    await executeQuery(sql, { CompetitionID: competitionId });
  }

  async publishCompetition(adminUserId: string, competitionId: string): Promise<void> {
    console.log('=== PUBLISH COMPETITION DEBUG ===');
    console.log('Admin User ID:', adminUserId);
    console.log('Competition ID:', competitionId);

    const sql = `UPDATE Competitions SET Status = 'Published', UpdatedDate = GETUTCDATE(), UpdatedBy = @UpdatedBy WHERE CompetitionID = @CompetitionID`;
    const result = await executeQuery(sql, { CompetitionID: competitionId, UpdatedBy: adminUserId });

    console.log('Publish result:', result);
  }


  async declareResult(adminUserId: string, competitionId: string, when: Date): Promise<void> {
    // Ensure column exists in DB per schema doc; update Competitions table
    const sql = `UPDATE Competitions SET ResultAnnounceDate=@When, UpdatedDate=GETUTCDATE(), UpdatedBy=@UpdatedBy WHERE CompetitionID=@CompetitionID`;
    await executeQuery(sql, { When: when, UpdatedBy: adminUserId, CompetitionID: competitionId });
  }

  async getCompetitionQuestions(competitionId: string): Promise<any[]> {
    try {
      const questionsSql = `
        SELECT q.QuestionID, q.QuestionText, q.QuestionTextHindi, q.QuestionType,
               q.QuestionImageURL, q.Points, q.TimeLimitSeconds, q.OrderIndex
        FROM Questions q
        WHERE q.CompetitionID = @CompetitionID AND q.IsActive = 1
        ORDER BY q.OrderIndex ASC`;

      const questionsRes = await executeQuery<any>(questionsSql, { CompetitionID: competitionId });
      const questions = (questionsRes as any).recordset || [];

      // Get options for MCQ questions
      for (const question of questions) {
        if (question.QuestionType === 'MCQ') {
          const optionsSql = `
            SELECT OptionText, OptionTextHindi, IsCorrect, OrderIndex
            FROM QuestionOptions
            WHERE QuestionID = @QuestionID
            ORDER BY OrderIndex ASC`;

          const optionsRes = await executeQuery<any>(optionsSql, { QuestionID: question.QuestionID });
          const options = (optionsRes as any).recordset || [];

          console.log(`Options for question ${question.QuestionID}:`, options);

          question.options = options.map((opt: any) => opt.OptionText);
          question.optionsHi = options.map((opt: any) => opt.OptionTextHindi || null);

          // Handle different possible values for IsCorrect (boolean, bit, number)
          question.correctAnswer = options.findIndex((opt: any) => {
            const isCorrect = opt.IsCorrect;
            return isCorrect === true || isCorrect === 1 || isCorrect === '1';
          });

          console.log(`Correct answer index for question ${question.QuestionID}:`, question.correctAnswer);
        }
      }

      const mappedQuestions = questions.map((q: any) => {
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
    } catch (error) {
      throw new DatabaseError('Failed to fetch competition questions');
    }
  }
}


export const competitionService = new CompetitionService();

