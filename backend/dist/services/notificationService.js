"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_1 = require("@/config/database");
class NotificationService {
    async getPublishedCompetitions() {
        const sql = `
      SELECT
        c.CompetitionID,
        c.Title,
        c.TitleHindi,
        c.StartDate,
        c.EndDate
      FROM Competitions c
      WHERE c.IsActive = 1 AND c.Status = 'Published'
      ORDER BY c.StartDate DESC`;
        const res = await (0, database_1.executeQuery)(sql);
        return res.recordset || [];
    }
    async getRecipientsWithStatus(competitionId) {
        const sql = `
      SELECT
        u.UserID,
        u.FirstName,
        u.LastName,
        u.FullName,
        u.MobileNumber,
        u.Gender,
        u.City,
        u.State,
        ISNULL(CAST(cn.MessageSent as int), 0) as MessageSent,
        cn.SentDateTime
      FROM Users u
      LEFT JOIN CompetitionNotifications cn
        ON cn.UserID = u.UserID AND cn.CompetitionID = @CompetitionID
      WHERE u.IsActive = 1
      ORDER BY u.CreatedDate DESC`;
        const res = await (0, database_1.executeQuery)(sql, { CompetitionID: competitionId });
        return res.recordset || [];
    }
    async recordSent(competitionId, userId) {
        const upsert = `
      MERGE CompetitionNotifications AS target
      USING (SELECT @CompetitionID AS CompetitionID, @UserID AS UserID) AS source
      ON (target.CompetitionID = source.CompetitionID AND target.UserID = source.UserID)
      WHEN MATCHED THEN
        UPDATE SET MessageSent = 1, SentDateTime = GETUTCDATE()
      WHEN NOT MATCHED THEN
        INSERT (CompetitionID, UserID, MessageSent, SentDateTime)
        VALUES (@CompetitionID, @UserID, 1, GETUTCDATE());`;
        await (0, database_1.executeQuery)(upsert, { CompetitionID: competitionId, UserID: userId });
    }
    async sendWhatsApp(mobile, message) {
        try {
            const provider = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();
            if (provider === 'twilio') {
                const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
                const authToken = process.env.TWILIO_AUTH_TOKEN || '';
                const from = process.env.TWILIO_WHATSAPP_FROM || '';
                if (!accountSid || !authToken || !from) {
                    console.warn('[notificationService] Twilio credentials not set. Simulating send.');
                    console.log(`[Simulated WhatsApp via Twilio] To: ${mobile} Message: ${message.substring(0, 80)}...`);
                    return { success: true, status: 200 };
                }
                const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
                const bodyParams = new URLSearchParams();
                bodyParams.append('To', `whatsapp:${mobile}`);
                bodyParams.append('From', from);
                bodyParams.append('Body', message);
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
                    },
                    body: bodyParams.toString()
                });
                const body = await resp.json().catch(() => ({}));
                if (resp.ok)
                    return { success: true, status: resp.status, body };
                return { success: false, status: resp.status, body, error: (body && body.message) || 'Twilio send failed' };
            }
            const apiUrl = process.env.WHATSAPP_API_URL || '';
            const apiKey = process.env.WHATSAPP_API_KEY || '';
            if (!apiUrl || !apiKey) {
                console.warn('[notificationService] WHATSAPP_API_URL/API_KEY not set. Simulating send.');
                console.log(`[Simulated WhatsApp] To: ${mobile} Message: ${message.substring(0, 80)}...`);
                return { success: true, status: 200 };
            }
            const resp = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ to: mobile, message }),
            });
            const body = await resp.json().catch(() => ({}));
            if (resp.ok)
                return { success: true, status: resp.status, body };
            return { success: false, status: resp.status, body, error: (body && body.error) || 'Failed to send' };
        }
        catch (e) {
            return { success: false, status: 0, error: e?.message || 'Unknown error' };
        }
    }
    async sendNotifications(competitionId, userIds, message) {
        const results = [];
        const usersSql = `SELECT UserID, MobileNumber FROM Users WHERE UserID IN (${userIds.map((_, i) => `@U${i}`).join(',')})`;
        const params = {};
        userIds.forEach((id, i) => (params[`U${i}`] = id));
        const usersRes = await (0, database_1.executeQuery)(usersSql, params);
        const mobiles = {};
        usersRes.recordset?.forEach((u) => (mobiles[String(u.UserID)] = u.MobileNumber));
        let sent = 0;
        for (const userId of userIds) {
            const mobile = (mobiles[userId] || '').trim();
            if (!mobile) {
                results.push({ userId, success: false, status: 0, error: 'No mobile number' });
                continue;
            }
            const r = await this.sendWhatsApp(mobile, message);
            if (r.success) {
                sent += 1;
                await this.recordSent(competitionId, userId);
                results.push({ userId, success: true, status: r.status });
            }
            else {
                const entry = { userId, success: false, status: r.status };
                if (r.error)
                    entry.error = r.error;
                results.push(entry);
            }
        }
        return { total: userIds.length, sent, results };
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map