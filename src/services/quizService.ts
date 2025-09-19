import api, {
  ApiResponse,
  Question,
  QuizAttempt,
  handleApiError
} from './api';

interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId?: string;
  descriptiveAnswer?: string;
  timeSpentSeconds?: number;
  isMarkedForReview?: boolean;
}

interface QuizResults {
  AttemptID: string;
  FinalScore: number;
  PercentageScore: number;
  TotalQuestions: number;
  CorrectAnswers: number;
  TimeSpentMinutes?: number;
  Rank?: number;
  TotalParticipants?: number;
}

class QuizService {
  /**
   * Start a quiz attempt
   */
  async startQuiz(competitionId: string): Promise<{
    success: boolean;
    attempt?: QuizAttempt | any;
    attemptId?: string;
    message: string
  }> {
    try {
      const response = await api.post<ApiResponse<any>>(`/quiz/start/${competitionId}`);
      const { success, message, data } = response.data || {};

      if (success) {
        // Normalize various backend response shapes into attemptId
        const attemptId =
          data?.AttemptID || data?.attemptId || data?.AttemptId ||
          data?.id || data?.attempt?.AttemptID || data?.attempt?.attemptId || data?.attempt?.id;
        return {
          success: true,
          attempt: data,
          attemptId,
          message
        };
      }

      return {
        success: false,
        message: message || 'Failed to start quiz'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get quiz attempt details
   */
  async getQuizAttempt(attemptId: string): Promise<{
    success: boolean;
    attempt?: QuizAttempt;
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<QuizAttempt>>(`/quiz/attempt/${attemptId}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          attempt: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Quiz attempt not found'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get questions for a quiz attempt
   */
  async getQuizQuestions(attemptId: string): Promise<{
    success: boolean;
    questions: Question[];
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<Question[]>>(`/quiz/attempt/${attemptId}/questions`);

      if (response.data.success) {
        return {
          success: true,
          questions: response.data.data || [],
          message: response.data.message
        };
      }

      return {
        success: false,
        questions: [],
        message: response.data.message || 'Failed to fetch quiz questions'
      };
    } catch (error) {
      return {
        success: false,
        questions: [],
        message: handleApiError(error)
      };
    }
  }

  /** Save progress (current index, remaining time, answers) */
  async saveProgress(
    attemptId: string,
    payload: { currentIndex?: number; remainingSeconds?: number; answers?: Array<{ questionId: string; selectedOptionIndex?: number; answerText?: string }>; }
  ): Promise<{ success: boolean; message: string }>{
    try {
      const response = await api.post<ApiResponse>(`/quiz/attempt/${attemptId}/save`, payload);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(attemptId: string, answerData: SubmitAnswerRequest): Promise<{
    success: boolean;
    message: string
  }> {
    try {
      const response = await api.post<ApiResponse>(`/quiz/attempt/${attemptId}/answer`, answerData);

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Submit entire quiz
   */
  async submitQuiz(attemptId: string): Promise<{
    success: boolean;
    results?: QuizResults;
    message: string
  }> {
    try {
      const response = await api.post<ApiResponse<QuizResults>>(`/quiz/attempt/${attemptId}/submit`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          results: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to submit quiz'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get quiz results
   */
  async getQuizResults(attemptId: string): Promise<{
    success: boolean;
    results?: QuizResults;
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<QuizResults>>(`/quiz/attempt/${attemptId}/results`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          results: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Quiz results not found'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }


  /** Get result summary by attempt */
  async getResultDetail(attemptId: string): Promise<{ success: boolean; message?: string; result?: any }> {
    try {
      const res = await api.get<ApiResponse>(`/quiz/attempts/${attemptId}/result`);
      return { success: true, result: (res.data as any).result };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  }

  /**
   * Get user's quiz history
   */
  async getQuizHistory(): Promise<{
    success: boolean;
    attempts: QuizAttempt[];
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<QuizAttempt[]>>('/quiz/history');

      if (response.data.success) {
        return {
          success: true,
          attempts: response.data.data || [],
          message: response.data.message
        };
      }

      return {
        success: false,
        attempts: [],
        message: response.data.message || 'Failed to fetch quiz history'
      };

    } catch (error) {
      return {
        success: false,
        attempts: [],
        message: handleApiError(error)
      };
    }
  }

  /** Get ongoing attempts for current user */
  async getOngoing(): Promise<{ success: boolean; attempts: any[]; message: string }> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/quiz/user/ongoing');
      if (response.data.success) {
        return { success: true, attempts: response.data.data || [], message: response.data.message };
      }
      return { success: false, attempts: [], message: response.data.message || 'Failed to fetch ongoing attempts' };
    } catch (error) {
      return { success: false, attempts: [], message: handleApiError(error) };
    }
  }


  /**
   * Resume quiz attempt
   */
  async resumeQuiz(attemptId: string): Promise<{
    success: boolean;
    attempt?: QuizAttempt;
    message: string
  }> {
    try {
      const response = await api.post<ApiResponse<QuizAttempt>>(`/quiz/resume/${attemptId}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          attempt: response.data.data,
          message: response.data.message
        };

      }

      return {
        success: false,
        message: response.data.message || 'Failed to resume quiz'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /** Completed attempts */
  async getCompleted(): Promise<{ success: boolean; attempts: any[]; message: string }> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/quiz/user/completed');
      return { success: true, attempts: response.data.data || [], message: response.data.message };
    } catch (error) {
      return { success: false, attempts: [], message: handleApiError(error) };
    }
  }

  /** Dashboard stats */
  async getUserStats(): Promise<{ success: boolean; stats: any; message: string }> {
    try {
      const response = await api.get<ApiResponse<any>>('/quiz/user/stats');
      return { success: true, stats: response.data.data || {}, message: response.data.message };
    } catch (error) {
      return { success: false, stats: {}, message: handleApiError(error) };
    }
  }
}

export const quizService = new QuizService();
export default quizService;
