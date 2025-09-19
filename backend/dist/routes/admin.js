"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("@/controllers/adminController");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
router.get('/stats', auth_1.authMiddleware, auth_1.adminMiddleware, (req, res) => adminController_1.adminController.getStats(req, res));
exports.default = router;
//# sourceMappingURL=admin.js.map