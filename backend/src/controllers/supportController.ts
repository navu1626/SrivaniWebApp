import { Request, Response } from 'express';
import { emailService } from '../services/emailService';

export async function submitSupport(req: Request, res: Response) {
  try {
  const { name, email, subject, message } = req.body;
  console.log('Incoming support request:', { name, email, subject });
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    // Basic email validation
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    if (!re.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

  await emailService.sendSupportEmail(name, email, subject || 'Support request', message);

  return res.status(200).json({ message: 'Support message sent successfully.' });
  } catch (error: any) {
  console.error('Support controller error:', error);
  // Return more detailed message for debugging (non-sensitive)
  const msg = error?.message || 'Failed to send support message.';
  return res.status(500).json({ message: msg });
  }
}
