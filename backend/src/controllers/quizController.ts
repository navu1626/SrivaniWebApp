import { Request, Response } from 'express';
import { quizService } from '../services/quizService';

import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';
import {
  ValidationError,
  NotFoundError
} from '../middleware/errorHandler';

class QuizController {
  /**
   * Start a quiz attempt
   */
  async startQuiz(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { competitionId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement quiz start logic
    const response: ApiResponse = {
      success: true,
      message: 'Quiz started successfully',
      data: {
        attemptId: 'sample-attempt-id',
        competitionId,
        startTime: new Date(),
        totalQuestions: 0,
      },
    };


    const result = await quizService.startQuiz(userId!, competitionId!);

    const response2: ApiResponse = {
      success: true,
      message: 'Quiz started successfully',
      data: result,
    };

    res.status(200).json(response2);
    return;
  }

  /**
   * Get ongoing attempts for current user
   */
  async getOngoingForUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const items = await quizService.getOngoingAttempts(userId);
    const response: ApiResponse = { success: true, message: 'Ongoing attempts', data: items };
    res.status(200).json(response);
  }

  /**
   * Get attempt info
   */
  async getAttempt(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params as { attemptId: string };
    const item = await quizService.getAttempt(attemptId);
    const response: ApiResponse = { success: true, message: 'Attempt retrieved', data: item };
    res.status(200).json(response);
  }

  /**
   * Get attempt questions
   */
  async getAttemptQuestionsApi(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params as { attemptId: string };
    const items = await quizService.getAttemptQuestions(attemptId);
    const response: ApiResponse = { success: true, message: 'Questions retrieved', data: items };
    res.status(200).json(response);
  }

  /** Save progress */
  async saveProgress(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params as { attemptId: string };
    await quizService.saveProgress(attemptId, req.body || {});
    const response: ApiResponse = { success: true, message: 'Progress saved' };
    res.status(200).json(response);
  }

  /** Submit attempt */
  async submitAttempt(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params as { attemptId: string };
    const result = await quizService.submitAttempt(attemptId);
    const response: ApiResponse = { success: true, message: 'Quiz submitted successfully', data: result };
    res.status(200).json(response);
  }

  /** Completed attempts for current user */
  async getCompletedForUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const items = await quizService.getCompletedAttempts(userId);
    const response: ApiResponse = { success: true, message: 'Completed attempts', data: items };
    res.status(200).json(response);
  }

  /** Dashboard stats */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const data = await quizService.getUserDashboardStats(userId);
    const response: ApiResponse = { success: true, message: 'Dashboard stats', data };
    res.status(200).json(response);
  }

  /**
   * Get quiz attempt details
   */
  async getQuizAttempt(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement get quiz attempt
    const response: ApiResponse = {
      success: true,
      message: 'Quiz attempt retrieved successfully',
      data: null,
    };

    res.status(200).json(response);
  }

  /**
   * Get questions for a quiz attempt
   */
  async getQuizQuestions(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement get quiz questions
    const response: ApiResponse = {
      success: true,
      message: 'Quiz questions retrieved successfully',
      data: [],
    };

    res.status(200).json(response);
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement answer submission
    const response: ApiResponse = {
      success: true,
      message: 'Answer submitted successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Submit entire quiz
   */
  async submitQuiz(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement quiz submission
    const response: ApiResponse = {
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        finalScore: 0,
        percentageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Get attempt result (summary)
   */
  async getAttemptResult(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params as { attemptId: string };
    const userId = req.user!.userId;

    const result = await quizService.getAttemptResultSummary(userId, attemptId);
    const response: ApiResponse = { success: true, message: 'Result retrieved', result } as any;
    res.status(200).json(response);
  }


  /**
   * Get quiz results
   */
  async getQuizResults(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement get quiz results
    const response: ApiResponse = {
      success: true,
      message: 'Quiz results retrieved successfully',
      data: null,
    };

    res.status(200).json(response);
  }

  /**
   * Get user's quiz history
   */
  async getQuizHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    // TODO: Implement get quiz history
    const response: ApiResponse = {
      success: true,
      message: 'Quiz history retrieved successfully',
      data: [],
    };

    res.status(200).json(response);
  }

  /**
   * Resume quiz attempt
   */
  async resumeQuiz(req: Request, res: Response): Promise<void> {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement resume quiz
    const response: ApiResponse = {
      success: true,
      message: 'Quiz resumed successfully',
      data: null,
    };

    res.status(200).json(response);
  }
}

export const quizController = new QuizController();
