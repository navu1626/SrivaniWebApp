"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const adminService_1 = require("../services/adminService");
class AdminController {
    async getStats(req, res) {
        try {
            const stats = await adminService_1.adminService.getOverviewStats();
            return res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('adminController.getStats error', error);
            return res.status(500).json({ success: false, message: error.message || 'Failed to load admin stats' });
        }
    }
}
exports.adminController = new AdminController();
//# sourceMappingURL=adminController.js.map