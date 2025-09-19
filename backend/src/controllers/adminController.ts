import { Request, Response } from 'express';
import { adminService } from '@/services/adminService';

class AdminController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getOverviewStats();
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('adminController.getStats error', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to load admin stats' });
    }
  }
}

export const adminController = new AdminController();
