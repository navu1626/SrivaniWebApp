import api, {
  ApiResponse,
  PaginatedResponse,
  Competition,
  Question,
  QuizAttempt,
  handleApiError
} from './api';

class CompetitionService {
  /** Copy a competition (Admin only) */
  async copyCompetition(competitionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>(`/competitions/${competitionId}/copy`);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  }

  /**
   * Get all competitions
   */
  async getCompetitions(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    competitions: Competition[];
    pagination?: any;
    message: string
  }> {
    try {
      const response = await api.get<PaginatedResponse<Competition>>('/competitions', {
        params: { page, limit }
      });

      if (response.data.success) {
        return {
          success: true,
          competitions: response.data.data || [],
          pagination: response.data.pagination,
          message: response.data.message
        };
      }

      return {
        success: false,
        competitions: [],
        message: response.data.message || 'Failed to fetch competitions'
      };
    } catch (error) {
      return {
        success: false,
        competitions: [],
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(competitionId: string): Promise<{
    success: boolean;
    competition?: Competition;
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<Competition>>(`/competitions/${competitionId}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          competition: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Competition not found'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Register for competition
   */
  async registerForCompetition(competitionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>(`/competitions/${competitionId}/register`);

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
   * Get user's registered competitions
   */
  async getUserCompetitions(): Promise<{
    success: boolean;
    competitions: Competition[];
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<Competition[]>>('/competitions/user/registered');

      if (response.data.success) {
        return {
          success: true,
          competitions: response.data.data || [],
          message: response.data.message
        };
      }

      return {
        success: false,
        competitions: [],
        message: response.data.message || 'Failed to fetch user competitions'
      };
    } catch (error) {
      return {
        success: false,
        competitions: [],
        message: handleApiError(error)
      };
    }
  }

  /**
   * Create competition (Admin only)
   */
  async createCompetition(competitionData: any): Promise<{
    success: boolean;
    competitionId?: string;
    message: string
  }> {
    try {
      const response = await api.post<ApiResponse<Competition>>('/competitions', competitionData);

      if (response.data.success && response.data.data) {
        const newId = (response.data.data as any)?.competitionId || (response.data.data as any)?.CompetitionID;
        return {
          success: true,
          competitionId: newId,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to create competition'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Update competition (Admin only)
   */
  async updateCompetition(competitionId: string, competitionData: any): Promise<{
    success: boolean;
    competition?: Competition;
    message: string
  }> {
    try {
      const response = await api.put<ApiResponse<Competition>>(`/competitions/${competitionId}`, competitionData);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          competition: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to update competition'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Delete competition (Admin only)
   */
  async deleteCompetition(competitionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/competitions/${competitionId}`);

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
   * Publish competition (Admin only)
   */
  async publishCompetition(competitionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch<ApiResponse>(`/competitions/${competitionId}/publish`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  }

  /**
   * Declare result (Admin only)
   */
  async declareResult(competitionId: string, announceDate?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch<ApiResponse>(`/competitions/${competitionId}/declare-result`, announceDate ? { announceDate } : {});
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    }
  }

  /** User-specific Active competitions */
  async getActiveForUser(): Promise<{ success: boolean; competitions: Competition[]; message: string }> {
    try {
      const response = await api.get<ApiResponse<Competition[]>>('/competitions/user/active');
      return { success: true, competitions: response.data.data || [], message: response.data.message };
    } catch (error) {
      return { success: false, competitions: [], message: handleApiError(error) };
    }
  }

  /** User-specific Upcoming competitions */
  async getUpcomingForUser(): Promise<{ success: boolean; competitions: Competition[]; message: string }> {
    try {
      const response = await api.get<ApiResponse<Competition[]>>('/competitions/user/upcoming');
      return { success: true, competitions: response.data.data || [], message: response.data.message };
    } catch (error) {
      return { success: false, competitions: [], message: handleApiError(error) };
    }
  }

  /** Get competitions by status (public) */
  async getCompetitionsByStatus(status: 'Active' | 'Upcoming' | 'Completed', limit: number = 6): Promise<{ success: boolean; competitions: Competition[]; message: string }> {
    try {
      const response = await api.get<ApiResponse<Competition[]>>('/competitions', {
        params: { status, limit }
      });
      return { success: true, competitions: response.data.data || [], message: response.data.message };
    } catch (error) {
      return { success: false, competitions: [], message: handleApiError(error) };
    }
  }

  /**
   * Get questions for a specific competition
   */
  async getCompetitionQuestions(competitionId: string): Promise<{
    success: boolean;
    questions: Question[];
    message: string
  }> {
    try {
      const response = await api.get<ApiResponse<Question[]>>(`/competitions/${competitionId}/questions`);

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
        message: response.data.message || 'Failed to fetch competition questions'
      };
    } catch (error) {
      return {
        success: false,
        questions: [],
        message: handleApiError(error)
      };
    }
  }
}

export const competitionService = new CompetitionService();
export default competitionService;
