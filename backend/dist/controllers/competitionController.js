"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitionController = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
const competitionService_1 = require("../services/competitionService");
class CompetitionController {
    async getAllCompetitions(req, res) {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const status = req.query.status;
        const result = await competitionService_1.competitionService.getAllCompetitions(page, limit, status);
        const response = {
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
        };
        res.status(200).json(response);
    }
    async getCompetitionById(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const competition = await competitionService_1.competitionService.getCompetitionById(competitionId);
        const response = {
            success: true,
            message: 'Competition retrieved successfully',
            data: competition,
        };
        res.status(200).json(response);
    }
    async createCompetition(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            console.log('Request body:', req.body);
            throw new errorHandler_1.ValidationError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
        }
        const adminUserId = req.user.userId;
        const payload = req.body;
        const result = await competitionService_1.competitionService.createCompetition(adminUserId, payload);
        const response = {
            success: true,
            message: 'Competition created successfully',
            data: { competitionId: result.competitionId },
        };
        res.status(201).json(response);
    }
    async updateCompetition(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Update validation errors:', errors.array());
            console.log('Update request body:', req.body);
            throw new errorHandler_1.ValidationError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`);
        }
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const adminUserId = req.user.userId;
        const updated = await competitionService_1.competitionService.updateCompetition(adminUserId, competitionId, req.body);
        const response = {
            success: true,
            message: 'Competition updated successfully',
            data: updated,
        };
        res.status(200).json(response);
    }
    async deleteCompetition(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        await competitionService_1.competitionService.deleteCompetition(competitionId);
        const response = {
            success: true,
            message: 'Competition deleted successfully',
        };
        res.status(200).json(response);
    }
    async publishCompetition(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const adminUserId = req.user.userId;
        await competitionService_1.competitionService.publishCompetition(adminUserId, competitionId);
        const response = {
            success: true,
            message: 'Competition published successfully',
        };
        res.status(200).json(response);
    }
    async declareResult(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const adminUserId = req.user.userId;
        const when = (req.body?.announceDate ? new Date(req.body.announceDate) : new Date());
        await competitionService_1.competitionService.declareResult(adminUserId, competitionId, when);
        const response = {
            success: true,
            message: 'Result declared successfully',
        };
        res.status(200).json(response);
    }
    async getActiveForUser(req, res) {
        const userId = req.user.userId;
        const items = await (await Promise.resolve().then(() => __importStar(require('@/services/quizService')))).quizService.getActiveCompetitionsForUser(userId);
        const response = { success: true, message: 'Active competitions for user', data: items };
        res.status(200).json(response);
    }
    async getUpcomingForUser(req, res) {
        const userId = req.user.userId;
        const items = await (await Promise.resolve().then(() => __importStar(require('@/services/quizService')))).quizService.getUpcomingCompetitionsForUser(userId);
        const response = { success: true, message: 'Upcoming competitions for user', data: items };
        res.status(200).json(response);
    }
    async copyCompetition(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const adminUserId = req.user.userId;
        const newId = await competitionService_1.competitionService.copyCompetition(adminUserId, competitionId);
        const response = {
            success: true,
            message: 'Competition copied successfully',
            data: { competitionId: newId },
        };
        res.status(201).json(response);
    }
    async registerForCompetition(req, res) {
        const { competitionId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Successfully registered for competition',
        };
        res.status(200).json(response);
    }
    async getUserCompetitions(req, res) {
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'User competitions retrieved successfully',
            data: [],
        };
        res.status(200).json(response);
    }
    async getCompetitionQuestions(req, res) {
        const { competitionId } = req.params;
        if (!competitionId) {
            throw new errorHandler_1.ValidationError('Competition ID is required');
        }
        const questions = await competitionService_1.competitionService.getCompetitionQuestions(competitionId);
        const response = {
            success: true,
            message: 'Competition questions retrieved successfully',
            data: questions,
        };
        res.status(200).json(response);
    }
}
exports.competitionController = new CompetitionController();
//# sourceMappingURL=competitionController.js.map