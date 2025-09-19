import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse, PaginatedResponse } from '../types';
import {
  ValidationError,
  NotFoundError
} from '../middleware/errorHandler';
import { competitionService } from '../services/competitionService';


class CompetitionController {
  /**
   * Get all competitions
   */
  async getAllCompetitions(req: Request, res: Response): Promise<void> {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const status = req.query.status as string;

    const result = await competitionService.getAllCompetitions(page, limit, status);

    const response: ApiResponse = {
      success: true,
      message: 'Competitions retrieved successfully',
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      }
    } as any;

    res.status(200).json(response);
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }

    const competition = await competitionService.getCompetitionById(competitionId);

    const response: ApiResponse = {
      success: true,
      message: 'Competition retrieved successfully',
      data: competition,
    };

    res.status(200).json(response);
  }

  /**
   * Create new competition (admin only)
   */
  async createCompetition(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      throw new ValidationError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
    }

    const adminUserId = req.user!.userId;
    const payload = req.body;

    const result = await competitionService.createCompetition(adminUserId, payload);

    const response: ApiResponse = {
      success: true,
      message: 'Competition created successfully',
      data: { competitionId: result.competitionId },
    };

    res.status(201).json(response);
  }

  /**
   * Update competition (admin only)
   */
  async updateCompetition(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update validation errors:', errors.array());
      console.log('Update request body:', req.body);
      throw new ValidationError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
    }

    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }
    const adminUserId = req.user!.userId;

    const updated = await competitionService.updateCompetition(adminUserId, competitionId, req.body);

    const response: ApiResponse = {
      success: true,
      message: 'Competition updated successfully',
      data: updated,
    };

    res.status(200).json(response);
  }

  /**
   * Delete competition (admin only)
   */
  async deleteCompetition(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }

    await competitionService.deleteCompetition(competitionId);

    const response: ApiResponse = {
      success: true,
      message: 'Competition deleted successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Publish competition (admin only)
   */
  async publishCompetition(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }
    const adminUserId = req.user!.userId;

    await competitionService.publishCompetition(adminUserId, competitionId);

    const response: ApiResponse = {
      success: true,
      message: 'Competition published successfully',
    };
    res.status(200).json(response);
  }

  /**
   * Declare result for competition (admin only)
   */
  async declareResult(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }
    const adminUserId = req.user!.userId;

    const when = (req.body?.announceDate ? new Date(req.body.announceDate) : new Date());
    await competitionService.declareResult(adminUserId, competitionId, when);

    const response: ApiResponse = {
      success: true,
      message: 'Result declared successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Active competitions for current user
   */
  async getActiveForUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const items = await (await import('@/services/quizService')).quizService.getActiveCompetitionsForUser(userId);
    const response: ApiResponse = { success: true, message: 'Active competitions for user', data: items };
    res.status(200).json(response);
  }

  /**
   * Upcoming competitions for current user
   */
  async getUpcomingForUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const items = await (await import('@/services/quizService')).quizService.getUpcomingCompetitionsForUser(userId);
    const response: ApiResponse = { success: true, message: 'Upcoming competitions for user', data: items };
    res.status(200).json(response);
  }



  /**
   * Copy competition (admin only)
   */
  async copyCompetition(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }
    const adminUserId = req.user!.userId;

    const newId = await competitionService.copyCompetition(adminUserId, competitionId);

    const response: ApiResponse = {
      success: true,
      message: 'Competition copied successfully',
      data: { competitionId: newId },
    };

    res.status(201).json(response);
  }

  /**
   * Register for competition
   */
  async registerForCompetition(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement competition registration
    const response: ApiResponse = {
      success: true,
      message: 'Successfully registered for competition',
    };

    res.status(200).json(response);
  }

  /**
   * Get user's registered competitions
   */
  async getUserCompetitions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    // TODO: Implement get user competitions
    const response: ApiResponse = {
      success: true,
      message: 'User competitions retrieved successfully',
      data: [],
    };

    res.status(200).json(response);
  }

  /**
   * Get competition questions (admin only)
   */
  async getCompetitionQuestions(req: Request, res: Response): Promise<void> {
    const { competitionId } = req.params as { competitionId: string };
    if (!competitionId) {
      throw new ValidationError('Competition ID is required');
    }

    const questions = await competitionService.getCompetitionQuestions(competitionId);

    const response: ApiResponse = {
      success: true,
      message: 'Competition questions retrieved successfully',
      data: questions,
    };

    res.status(200).json(response);
  }
}

export const competitionController = new CompetitionController();
