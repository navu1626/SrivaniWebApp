"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const database_1 = require("@/config/database");
const errorHandler_1 = require("@/middleware/errorHandler");
class AdminService {
    async getOverviewStats() {
        try {
            const usersRes = await (0, database_1.executeQuery)(`SELECT COUNT(*) as total FROM Users WHERE IsActive = 1`);
            const totalUsers = usersRes.recordset?.[0]?.total || 0;
            const compRes = await (0, database_1.executeQuery)(`
        SELECT COUNT(*) as total FROM Competitions c
        WHERE c.IsActive = 1 AND c.Status = 'Published' AND c.StartDate <= GETUTCDATE() AND c.EndDate >= GETUTCDATE()
      `);
            const activeCompetitions = compRes.recordset?.[0]?.total || 0;
            const subsRes = await (0, database_1.executeQuery)(`
        SELECT COUNT(*) as total FROM QuizAttempts qa WHERE qa.Status = 'Completed'
      `);
            const totalSubmissions = subsRes.recordset?.[0]?.total || 0;
            const recentUserRes = await (0, database_1.executeQuery)(`
        SELECT TOP 1 UserID, Email, FirstName, LastName, FullName, CreatedDate FROM Users WHERE IsActive = 1 ORDER BY CreatedDate DESC
      `);
            const mostRecentUser = recentUserRes.recordset?.[0] || null;
            const recentEndedRes = await (0, database_1.executeQuery)(`
        SELECT CompetitionID, Title, EndDate FROM Competitions
        WHERE IsActive = 1 AND EndDate BETWEEN DATEADD(day, -3, GETUTCDATE()) AND GETUTCDATE()
        ORDER BY EndDate DESC
      `);
            const recentEndedCompetitions = recentEndedRes.recordset || [];
            const submissionsActiveRes = await (0, database_1.executeQuery)(`
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
        }
        catch (error) {
            console.error('AdminService.getOverviewStats error', error);
            throw new errorHandler_1.DatabaseError('Failed to load admin overview stats');
        }
    }
}
exports.adminService = new AdminService();
//# sourceMappingURL=adminService.js.map