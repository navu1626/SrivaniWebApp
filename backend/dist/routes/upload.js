"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploadController_1 = require("../controllers/uploadController");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || 'uploads';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,xlsx,xls').split(',');
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase().substring(1);
    if (allowedTypes.includes(fileExtension)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type .${fileExtension} is not allowed`), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    },
});
router.post('/profile-image', upload.single('image'), (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.uploadProfileImage));
router.post('/competition-banner', auth_1.authMiddleware, auth_1.adminMiddleware, upload.single('banner'), (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.uploadCompetitionBanner));
router.post('/questions-excel', auth_1.authMiddleware, auth_1.adminMiddleware, upload.single('excel'), (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.uploadQuestionsExcel));
router.get('/file/:fileId', (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.getFile));
router.delete('/file/:fileId', (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.deleteFile));
router.post('/question-image', auth_1.authMiddleware, auth_1.adminMiddleware, uploadController_1.questionImageUpload.single('image'), (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.uploadQuestionImage));
router.delete('/question-image/:filename', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(uploadController_1.uploadController.deleteQuestionImage));
exports.default = router;
//# sourceMappingURL=upload.js.map