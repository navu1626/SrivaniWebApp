"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizController = void 0;
const quizService_1 = require("@/services/quizService");
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("@/middleware/errorHandler");
class QuizController {
    async startQuiz(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { competitionId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz started successfully',
            data: {
                attemptId: 'sample-attempt-id',
                competitionId,
                startTime: new Date(),
                totalQuestions: 0,
            },
        };
        const result = await quizService_1.quizService.startQuiz(userId, competitionId);
        const response2 = {
            success: true,
            message: 'Quiz started successfully',
            data: result,
        };
        res.status(200).json(response2);
        return;
    }
    async getOngoingForUser(req, res) {
        const userId = req.user.userId;
        const items = await quizService_1.quizService.getOngoingAttempts(userId);
        const response = { success: true, message: 'Ongoing attempts', data: items };
        res.status(200).json(response);
    }
    async getAttempt(req, res) {
        const { attemptId } = req.params;
        const item = await quizService_1.quizService.getAttempt(attemptId);
        const response = { success: true, message: 'Attempt retrieved', data: item };
        res.status(200).json(response);
    }
    async getAttemptQuestionsApi(req, res) {
        const { attemptId } = req.params;
        const items = await quizService_1.quizService.getAttemptQuestions(attemptId);
        const response = { success: true, message: 'Questions retrieved', data: items };
        res.status(200).json(response);
    }
    async saveProgress(req, res) {
        const { attemptId } = req.params;
        await quizService_1.quizService.saveProgress(attemptId, req.body || {});
        const response = { success: true, message: 'Progress saved' };
        res.status(200).json(response);
    }
    async submitAttempt(req, res) {
        const { attemptId } = req.params;
        const result = await quizService_1.quizService.submitAttempt(attemptId);
        const response = { success: true, message: 'Quiz submitted successfully', data: result };
        res.status(200).json(response);
    }
    async getCompletedForUser(req, res) {
        const userId = req.user.userId;
        const items = await quizService_1.quizService.getCompletedAttempts(userId);
        const response = { success: true, message: 'Completed attempts', data: items };
        res.status(200).json(response);
    }
    async getDashboardStats(req, res) {
        const userId = req.user.userId;
        const data = await quizService_1.quizService.getUserDashboardStats(userId);
        const response = { success: true, message: 'Dashboard stats', data };
        res.status(200).json(response);
    }
    async getQuizAttempt(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz attempt retrieved successfully',
            data: null,
        };
        res.status(200).json(response);
    }
    async getQuizQuestions(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz questions retrieved successfully',
            data: [],
        };
        res.status(200).json(response);
    }
    async submitAnswer(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Answer submitted successfully',
        };
        res.status(200).json(response);
    }
    async submitQuiz(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
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
    async getAttemptResult(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const result = await quizService_1.quizService.getAttemptResultSummary(userId, attemptId);
        const response = { success: true, message: 'Result retrieved', result };
        res.status(200).json(response);
    }
    async getQuizResults(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz results retrieved successfully',
            data: null,
        };
        res.status(200).json(response);
    }
    async getQuizHistory(req, res) {
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz history retrieved successfully',
            data: [],
        };
        res.status(200).json(response);
    }
    async resumeQuiz(req, res) {
        const { attemptId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Quiz resumed successfully',
            data: null,
        };
        res.status(200).json(response);
    }
}
exports.quizController = new QuizController();
//# sourceMappingURL=quizController.js.map