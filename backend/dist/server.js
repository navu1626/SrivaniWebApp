"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const competitions_1 = __importDefault(require("./routes/competitions"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const upload_1 = __importDefault(require("./routes/upload"));
const support_1 = __importDefault(require("./routes/support"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
const allowedOrigins = (process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173']);
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: (process.env.CORS_CREDENTIALS ?? 'true') === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Sarvagyyam Prashanasaar API is running',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1'
    });
});
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, auth_2.default);
app.use(`/api/${apiVersion}/users`, auth_1.authMiddleware, users_1.default);
app.use(`/api/${apiVersion}/competitions`, competitions_1.default);
app.use(`/api/${apiVersion}/quiz`, auth_1.authMiddleware, quiz_1.default);
app.use(`/api/${apiVersion}/upload`, auth_1.authMiddleware, upload_1.default);
app.use(`/api/${apiVersion}/support`, support_1.default);
app.use(`/api/${apiVersion}/notifications`, notifications_1.default);
app.use(`/api/${apiVersion}/admin`, admin_1.default);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
async function startServer() {
    try {
        try {
            const provider = (process.env.WHATSAPP_PROVIDER || '').toLowerCase() || 'none';
            const twSid = process.env.TWILIO_ACCOUNT_SID || '';
            const twToken = process.env.TWILIO_AUTH_TOKEN ? '*****' : '';
            const twFrom = process.env.TWILIO_WHATSAPP_FROM || '';
            console.log(`[notificationService] Provider: ${provider}`);
            if (provider === 'twilio') {
                console.log(`[notificationService] Twilio SID: ${twSid ? 'present' : 'missing'}, Auth Token: ${twToken ? 'present' : 'missing'}, From: ${twFrom ? twFrom : 'missing'}`);
            }
            else {
                const apiUrl = process.env.WHATSAPP_API_URL || '';
                const apiKey = process.env.WHATSAPP_API_KEY ? '*****' : '';
                console.log(`[notificationService] Generic API URL: ${apiUrl ? 'present' : 'missing'}, API Key: ${apiKey ? 'present' : 'missing'}`);
            }
        }
        catch (e) {
        }
        let dbStatusSummary = '';
        try {
            await (0, database_1.connectDatabase)();
            dbStatusSummary = '✅ DB: Connected';
            console.log('✅ Database connected successfully');
        }
        catch (dbError) {
            const msg = dbError.message || String(dbError);
            dbStatusSummary = `❌ DB: Not connected - ${msg}`;
            console.warn('⚠️ Database connection failed, server will start without DB:', msg);
            console.warn('🔧 Please check your database configuration and connection');
        }
        app.listen(PORT, () => {
            console.log('================ Sarvagyyam Prashanasaar Backend =================');
            console.log(`🟢 Server: http://localhost:${PORT}`);
            console.log(dbStatusSummary);
            console.log(`📖 Env: ${process.env.NODE_ENV}`);
            console.log(`🔗 API: http://localhost:${PORT}/api/${apiVersion}`);
            console.log(`💚 Health: http://localhost:${PORT}/health`);
            console.log('-------------------------------------------------------');
            console.log('📋 Endpoints:');
            console.log(`   GET  /health - Health check`);
            console.log(`   POST /api/${apiVersion}/auth/login - User login`);
            console.log(`   POST /api/${apiVersion}/auth/register - User registration`);
            console.log('-------------------------------------------------------');
            console.log('🔧 DB help if needed:');
            console.log('   1) Ensure SQL Server/LocalDB is running');
            console.log('   2) Check backend/src/config/database.ts');
            console.log('   3) Verify DB exists and tables created');
            console.log('=======================================================');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map