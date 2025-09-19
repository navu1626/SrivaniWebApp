"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.questionImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../middleware/errorHandler");
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
const questionImagesDir = path_1.default.join(uploadsDir, 'question-images');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(questionImagesDir)) {
    fs_1.default.mkdirSync(questionImagesDir, { recursive: true });
}
const questionImageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, questionImagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, `question-${uniqueSuffix}${extension}`);
    }
});
exports.questionImageUpload = (0, multer_1.default)({
    storage: questionImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
class UploadController {
    async uploadProfileImage(req, res) {
        if (!req.file) {
            throw new errorHandler_1.ValidationError('No file uploaded');
        }
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                fileId: 'sample-file-id',
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileUrl: `/uploads/${req.file.filename}`,
                fileSize: req.file.size,
            },
        };
        res.status(200).json(response);
    }
    async uploadCompetitionBanner(req, res) {
        if (!req.file) {
            throw new errorHandler_1.ValidationError('No file uploaded');
        }
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Competition banner uploaded successfully',
            data: {
                fileId: 'sample-file-id',
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileUrl: `/uploads/${req.file.filename}`,
                fileSize: req.file.size,
            },
        };
        res.status(200).json(response);
    }
    async uploadQuestionsExcel(req, res) {
        if (!req.file) {
            throw new errorHandler_1.ValidationError('No file uploaded');
        }
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'Questions Excel file uploaded successfully',
            data: {
                fileId: 'sample-file-id',
                fileName: req.file.filename,
                originalName: req.file.originalname,
                processedQuestions: 0,
                errors: [],
            },
        };
        res.status(200).json(response);
    }
    async getFile(req, res) {
        const { fileId } = req.params;
        const response = {
            success: true,
            message: 'File retrieved successfully',
            data: null,
        };
        res.status(200).json(response);
    }
    async deleteFile(req, res) {
        const { fileId } = req.params;
        const userId = req.user.userId;
        const response = {
            success: true,
            message: 'File deleted successfully',
        };
        res.status(200).json(response);
    }
    async uploadQuestionImage(req, res) {
        if (!req.file) {
            throw new errorHandler_1.ValidationError('No image file provided');
        }
        try {
            const imageUrl = `/uploads/question-images/${req.file.filename}`;
            const response = {
                success: true,
                message: 'Question image uploaded successfully',
                data: {
                    imageUrl
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            if (req.file) {
                try {
                    fs_1.default.unlinkSync(req.file.path);
                }
                catch (unlinkError) {
                    console.error('Error deleting uploaded file:', unlinkError);
                }
            }
            throw error;
        }
    }
    async deleteQuestionImage(req, res) {
        try {
            const { filename } = req.params;
            if (!filename) {
                throw new errorHandler_1.ValidationError('Filename is required');
            }
            const filePath = path_1.default.join(questionImagesDir, filename);
            if (!fs_1.default.existsSync(filePath)) {
                throw new errorHandler_1.ValidationError('Image not found');
            }
            fs_1.default.unlinkSync(filePath);
            const response = {
                success: true,
                message: 'Question image deleted successfully'
            };
            res.status(200).json(response);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.uploadController = new UploadController();
//# sourceMappingURL=uploadController.js.map