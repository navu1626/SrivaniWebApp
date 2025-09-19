"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitSupport = submitSupport;
const emailService_1 = require("../services/emailService");
async function submitSupport(req, res) {
    try {
        const { name, email, subject, message } = req.body;
        console.log('Incoming support request:', { name, email, subject });
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required.' });
        }
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
        if (!re.test(email)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }
        await emailService_1.emailService.sendSupportEmail(name, email, subject || 'Support request', message);
        return res.status(200).json({ message: 'Support message sent successfully.' });
    }
    catch (error) {
        console.error('Support controller error:', error);
        const msg = error?.message || 'Failed to send support message.';
        return res.status(500).json({ message: msg });
    }
}
//# sourceMappingURL=supportController.js.map