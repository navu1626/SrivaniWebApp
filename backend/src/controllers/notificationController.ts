import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

class NotificationController {
  getPublishedCompetitions = async (_req: Request, res: Response) => {
    const items = await notificationService.getPublishedCompetitions();
    return res.status(200).json({ success: true, message: 'OK', data: items });
  };

  getRecipients = async (req: Request, res: Response) => {
    const { competitionId } = req.query as { competitionId?: string };
    if (!competitionId) {
      return res.status(400).json({ success: false, message: 'competitionId is required' });
    }
    const recipients = await notificationService.getRecipientsWithStatus(competitionId);
    return res.status(200).json({ success: true, message: 'OK', data: recipients });
  };

  send = async (req: Request, res: Response) => {
    const { competitionId, userIds, message } = req.body as { competitionId?: string; userIds?: string[]; message?: string };
    if (!competitionId || !Array.isArray(userIds) || !userIds.length || !message) {
      return res.status(400).json({ success: false, message: 'competitionId, userIds[], and message are required' });
    }
    const result = await notificationService.sendNotifications(competitionId, userIds, message);
    return res.status(200).json({ success: true, message: `Sent ${result.sent}/${result.total}`, data: result });
  };
}

export const notificationController = new NotificationController();

