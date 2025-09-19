"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.get('/competitions', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(notificationController_1.notificationController.getPublishedCompetitions));
router.get('/recipients', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(notificationController_1.notificationController.getRecipients));
router.post('/send', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(notificationController_1.notificationController.send));
exports.default = router;
//# sourceMappingURL=notifications.js.map