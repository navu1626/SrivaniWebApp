"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notificationService_1 = require("@/services/notificationService");
class NotificationController {
    constructor() {
        this.getPublishedCompetitions = async (_req, res) => {
            const items = await notificationService_1.notificationService.getPublishedCompetitions();
            return res.status(200).json({ success: true, message: 'OK', data: items });
        };
        this.getRecipients = async (req, res) => {
            const { competitionId } = req.query;
            if (!competitionId) {
                return res.status(400).json({ success: false, message: 'competitionId is required' });
            }
            const recipients = await notificationService_1.notificationService.getRecipientsWithStatus(competitionId);
            return res.status(200).json({ success: true, message: 'OK', data: recipients });
        };
        this.send = async (req, res) => {
            const { competitionId, userIds, message } = req.body;
            if (!competitionId || !Array.isArray(userIds) || !userIds.length || !message) {
                return res.status(400).json({ success: false, message: 'competitionId, userIds[], and message are required' });
            }
            const result = await notificationService_1.notificationService.sendNotifications(competitionId, userIds, message);
            return res.status(200).json({ success: true, message: `Sent ${result.sent}/${result.total}`, data: result });
        };
    }
}
exports.notificationController = new NotificationController();
//# sourceMappingURL=notificationController.js.map