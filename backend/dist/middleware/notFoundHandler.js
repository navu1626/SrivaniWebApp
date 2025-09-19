"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (req, res, next) => {
    const response = {
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: 'The requested endpoint does not exist',
    };
    res.status(404).json(response);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map