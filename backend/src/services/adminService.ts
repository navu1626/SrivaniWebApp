import { executeQuery } from '../config/database';
import { DatabaseError } from '../middleware/errorHandler';

class AdminService {
  async getOverviewStats(): Promise<any> {
    try {
      // Total users
      const usersRes = await executeQuery<{ total: number }>(`SELECT COUNT(*) as total FROM Users WHERE IsActive = 1`);
      const totalUsers = usersRes.recordset?.[0]?.total || 0;

      // Active competitions: Published and currently within start/end
      const compRes = await executeQuery<{ total: number }>(`
        SELECT COUNT(*) as total FROM Competitions c
        WHERE c.IsActive = 1 AND c.Status = 'Published' AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()
      `);
      const activeCompetitions = compRes.recordset?.[0]?.total || 0;

      // Total submissions: count of QuizAttempts marked Completed
      const subsRes = await executeQuery<{ total: number }>(`
        SELECT COUNT(*) as total FROM QuizAttempts qa WHERE qa.Status = 'Completed'
      `);
      const totalSubmissions = subsRes.recordset?.[0]?.total || 0;

      // Most recent user
      const recentUserRes = await executeQuery<any>(`
        SELECT TOP 1 UserID, Email, FirstName, LastName, FullName, CreatedDate FROM Users WHERE IsActive = 1 ORDER BY CreatedDate DESC
      `);
      const mostRecentUser = recentUserRes.recordset?.[0] || null;

      // Competitions ended within last 3 days
      const recentEndedRes = await executeQuery<any>(`
        SELECT CompetitionID, Title, EndDate FROM Competitions
        WHERE IsActive = 1 AND EndDate BETWEEN DATEADD(day, -3, GETUTCDATE()) AND GETUTCDATE()
        ORDER BY EndDate DESC
      `);
      const recentEndedCompetitions = recentEndedRes.recordset || [];

      // Total submissions for currently active quizzes (joined by Competition)
      const submissionsActiveRes = await executeQuery<any>(`
        SELECT COUNT(qa.AttemptID) as total FROM QuizAttempts qa
        JOIN Competitions c ON qa.CompetitionID = c.CompetitionID
        WHERE c.IsActive = 1 AND c.Status = 'Published' AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()
      `);
      const submissionsForActive = submissionsActiveRes.recordset?.[0]?.total || 0;

      return {
        totalUsers,
        activeCompetitions,
        totalSubmissions,
        mostRecentUser,
        recentEndedCompetitions,
        submissionsForActive
      };
    } catch (error) {
      console.error('AdminService.getOverviewStats error', error);
      throw new DatabaseError('Failed to load admin overview stats');
    }
  }
}

export const adminService = new AdminService();
