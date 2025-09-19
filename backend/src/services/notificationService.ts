import { executeQuery } from '@/config/database';

export type NotificationRecipient = {
  UserID: string;
  FirstName: string;
  LastName: string;
  FullName?: string;
  MobileNumber?: string | null;
  Gender?: string | null;
  City?: string | null;
  State?: string | null;
  MessageSent?: number; // bit -> 0/1
  SentDateTime?: Date | null;
};

class NotificationService {
  async getPublishedCompetitions(): Promise<any[]> {
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
    const res = await executeQuery<any>(sql);
    return (res as any).recordset || [];
  }

  async getRecipientsWithStatus(competitionId: string): Promise<NotificationRecipient[]> {
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
    const res = await executeQuery<NotificationRecipient>(sql, { CompetitionID: competitionId });
    return (res as any).recordset || [];
  }

  async recordSent(competitionId: string, userId: string): Promise<void> {
    const upsert = `
      MERGE CompetitionNotifications AS target
      USING (SELECT @CompetitionID AS CompetitionID, @UserID AS UserID) AS source
      ON (target.CompetitionID = source.CompetitionID AND target.UserID = source.UserID)
      WHEN MATCHED THEN
        UPDATE SET MessageSent = 1, SentDateTime = GETUTCDATE()
      WHEN NOT MATCHED THEN
        INSERT (CompetitionID, UserID, MessageSent, SentDateTime)
        VALUES (@CompetitionID, @UserID, 1, GETUTCDATE());`;
    await executeQuery(upsert, { CompetitionID: competitionId, UserID: userId });
  }

  async sendWhatsApp(mobile: string, message: string): Promise<{ success: boolean; status: number; body?: any; error?: string }> {
    try {
      const provider = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();

      // Twilio provider
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
        } as RequestInit);

        const body: any = await resp.json().catch(() => ({} as any));
        if (resp.ok) return { success: true, status: resp.status, body };
        return { success: false, status: resp.status, body, error: (body && body.message) || 'Twilio send failed' };
      }

      // Generic provider using WHATSAPP_API_URL / WHATSAPP_API_KEY
      const apiUrl = process.env.WHATSAPP_API_URL || '';
      const apiKey = process.env.WHATSAPP_API_KEY || '';

      // If not configured, simulate success (dev mode)
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
      } as RequestInit);

      const body: any = await resp.json().catch(() => ({} as any));
      if (resp.ok) return { success: true, status: resp.status, body };
      return { success: false, status: resp.status, body, error: (body && body.error) || 'Failed to send' };
    } catch (e: any) {
      return { success: false, status: 0, error: e?.message || 'Unknown error' };
    }
  }

  async sendNotifications(competitionId: string, userIds: string[], message: string): Promise<{
    total: number;
    sent: number;
    results: Array<{ userId: string; success: boolean; status: number; error?: string }>
  }> {
    const results: Array<{ userId: string; success: boolean; status: number; error?: string }> = [];

    // Load mobiles for requested users
    const usersSql = `SELECT UserID, MobileNumber FROM Users WHERE UserID IN (${userIds.map((_, i) => `@U${i}`).join(',')})`;
    const params: Record<string, any> = {};
    userIds.forEach((id, i) => (params[`U${i}`] = id));
    const usersRes = await executeQuery<{ UserID: string; MobileNumber: string | null }>(usersSql, params);
    const mobiles: Record<string, string | null> = {};
    (usersRes as any).recordset?.forEach((u: any) => (mobiles[String(u.UserID)] = u.MobileNumber));

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
      } else {
        const entry: { userId: string; success: boolean; status: number; error?: string } = { userId, success: false, status: r.status };
        if (r.error) entry.error = r.error;
        results.push(entry);
      }
    }

    return { total: userIds.length, sent, results };
  }
}

export const notificationService = new NotificationService();

