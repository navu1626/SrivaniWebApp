"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const errorHandler_1 = require("../middleware/errorHandler");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendSupportEmail(fromName, fromEmail, subject, message) {
        try {
            const admin = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'Support'}" <${process.env.SMTP_USER}>`,
                to: admin,
                replyTo: `${fromName} <${fromEmail}>`,
                subject: `${process.env.APP_NAME} - Support: ${subject || 'User message'}`,
                html: `<p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
               <p><strong>Subject:</strong> ${subject}</p>
               <div><strong>Message:</strong><div>${message.replace(/\n/g, '<br/>')}</div></div>`,
            };
            try {
                if ((process.env.NODE_ENV || '').toLowerCase() === 'development') {
                    console.log('DEBUG mailOptions:', mailOptions);
                }
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Support email forwarded to ${admin} from ${fromEmail}`);
            }
            catch (err) {
                console.error('Transporter sendMail error:', err);
                throw new Error('SMTP send failed: ' + err.message);
            }
        }
        catch (error) {
            console.error('❌ Failed to send support email:', error);
            throw error;
        }
    }
    async sendVerificationEmail(user) {
        try {
            if (!user.EmailVerificationToken) {
                throw new Error('Email verification token not found');
            }
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.EmailVerificationToken}`;
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: user.Email,
                subject: `Welcome to ${process.env.APP_NAME} - Verify Your Email`,
                html: this.getVerificationEmailTemplate(user, verificationUrl),
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Verification email sent to ${user.Email}`);
        }
        catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw new errorHandler_1.DatabaseError('Failed to send verification email');
        }
    }
    async sendPasswordChangedNotification(user, newPassword) {
        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: user.Email,
                subject: `${process.env.APP_NAME} - Your Password Has Been Changed`,
                html: this.getPasswordChangedTemplate(user, newPassword),
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password changed notification sent to ${user.Email}`);
        }
        catch (error) {
            console.error('❌ Failed to send password changed notification:', error);
            throw new errorHandler_1.DatabaseError('Failed to send password changed notification');
        }
    }
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: user.Email,
                subject: `${process.env.APP_NAME} - Password Reset Request`,
                html: this.getPasswordResetEmailTemplate(user, resetUrl),
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${user.Email}`);
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw new errorHandler_1.DatabaseError('Failed to send password reset email');
        }
    }
    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: user.Email,
                subject: `Welcome to ${process.env.APP_NAME} - Your Spiritual Journey Begins!`,
                html: this.getWelcomeEmailTemplate(user),
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${user.Email}`);
        }
        catch (error) {
            console.error('❌ Failed to send welcome email:', error);
        }
    }
    getVerificationEmailTemplate(user, verificationUrl) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ${process.env.APP_NAME}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .message { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .om-symbol { font-size: 24px; color: #FF6B35; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="om-symbol">🕉️</div>
            <h1>${process.env.APP_NAME}</h1>
            <p style="color: white; margin: 10px 0 0 0;">Jain Community Quiz Platform</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Namaste ${user.FirstName} ${user.LastName},
            </div>
            
            <div class="message">
              <p>Welcome to ${process.env.APP_NAME}! We're excited to have you join our spiritual learning community.</p>
              
              <p>To complete your registration and start your journey of Jain knowledge, please verify your email address by clicking the button below:</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="message">
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #FF6B35;">${verificationUrl}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Participate in spiritual knowledge competitions</li>
                <li>Track your learning progress</li>
                <li>Connect with the Jain community</li>
                <li>Access content in English and Hindi</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>🙏 May your spiritual journey be filled with wisdom and peace</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    getPasswordResetEmailTemplate(user, resetUrl) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ${process.env.APP_NAME}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .message { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .om-symbol { font-size: 24px; color: #FF6B35; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="om-symbol">🕉️</div>
            <h1>${process.env.APP_NAME}</h1>
            <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Jai Jinendra ${user.FirstName} ${user.LastName},
            </div>
            
            <div class="message">
              <p>We received a request to reset your password for your ${process.env.APP_NAME} account.</p>
              
              <p>If you requested this password reset, please click the button below to create a new password:</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="message">
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #FF6B35;">${resetUrl}</p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important Security Information:</strong></p>
              <ul>
                <li>This password reset link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your current password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>🙏 Stay secure in your spiritual journey</p>
            <p>If you have any concerns, please contact our support team.</p>
            <p>&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    getWelcomeEmailTemplate(user) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${process.env.APP_NAME}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .message { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .feature-list { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .om-symbol { font-size: 24px; color: #FF6B35; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="om-symbol">🕉️</div>
            <h1>Welcome to ${process.env.APP_NAME}!</h1>
            <p style="color: white; margin: 10px 0 0 0;">Your Spiritual Learning Journey Begins</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Namaste ${user.FirstName} ${user.LastName},
            </div>
            
            <div class="message">
              <p>🎉 Congratulations! Your email has been verified and your account is now active.</p>
              
              <p>Welcome to our vibrant community of spiritual learners. ${process.env.APP_NAME} is designed to help you deepen your understanding of Jain philosophy, traditions, and values through engaging quizzes and competitions.</p>
            </div>
            
            <div class="feature-list">
              <h3 style="color: #FF6B35; margin-top: 0;">What you can do now:</h3>
              <ul>
                <li>🏆 Participate in spiritual knowledge competitions</li>
                <li>📚 Test your understanding of Jain principles</li>
                <li>🌟 Track your learning progress and achievements</li>
                <li>🌍 Access content in both English and Hindi</li>
                <li>👥 Connect with fellow community members</li>
                <li>🎯 Challenge yourself with different difficulty levels</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Start Your Journey</a>
            </div>
            
            <div class="message">
              <p><strong>🙏 Remember the Five Main Principles:</strong></p>
              <ul>
                <li><strong>Ahimsa</strong> - Non-violence</li>
                <li><strong>Satya</strong> - Truthfulness</li>
                <li><strong>Asteya</strong> - Non-stealing</li>
                <li><strong>Brahmacharya</strong> - Celibacy/Chastity</li>
                <li><strong>Aparigraha</strong> - Non-possessiveness</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>🕉️ May your journey be filled with wisdom, peace, and spiritual growth</p>
            <p>Need help? Contact our support team anytime.</p>
            <p>&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    getPasswordChangedTemplate(user, newPassword) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - ${process.env.APP_NAME}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .message { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .password-box { background-color: #f8f9fa; border: 2px solid #FF6B35; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .password { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #FF6B35; letter-spacing: 2px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .om-symbol { font-size: 24px; color: #FF6B35; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="om-symbol">🕉️</div>
            <h1>Password Changed</h1>
            <p style="color: white; margin: 10px 0 0 0;">${process.env.APP_NAME}</p>
          </div>

          <div class="content">
            <div class="greeting">
              Namaste ${user.FirstName} ${user.LastName},
            </div>

            <div class="message">
              <p>🔐 Your account password has been successfully changed by an administrator.</p>

              <p>Your new login credentials are:</p>
            </div>

            <div class="password-box">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Your New Password:</p>
              <div class="password">${newPassword}</div>
            </div>

            <div class="warning">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Important Security Notice:</strong></p>
              <ul style="margin: 10px 0 0 0; color: #856404;">
                <li>Please change this password after your next login for security</li>
                <li>Do not share this password with anyone</li>
                <li>Keep this email secure and delete it after changing your password</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
            </div>

            <div class="message">
              <p>If you did not request this password change or have any concerns about your account security, please contact our support team immediately.</p>

              <p>🙏 Thank you for being part of our spiritual learning community.</p>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated message from ${process.env.APP_NAME}</p>
            <p>Please do not reply to this email</p>
            <p style="margin-top: 15px;">
              <span class="om-symbol">🕉️</span> May your spiritual journey be filled with wisdom and peace
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map