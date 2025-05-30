// src/core/services/email.service.ts

import nodemailer from "nodemailer";
import { config } from "@/config/constants";
import { logger } from "@/core/utils/logger.util";

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: config.SMTP_HOST,
			port: config.SMTP_PORT,
			secure: config.SMTP_SECURE, // true for 465, false for other ports
			auth: {
				user: config.SMTP_USER,
				pass: config.SMTP_PASS,
			},
		});
	}

	async sendEmail(options: EmailOptions): Promise<void> {
		try {
			const mailOptions = {
				from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
				to: options.to,
				subject: options.subject,
				html: options.html,
				text: options.text,
			};

			const info = await this.transporter.sendMail(mailOptions);

			logger.info("Email sent successfully:", {
				messageId: info.messageId,
				to: options.to,
				subject: options.subject,
			});
		} catch (error) {
			logger.error("Failed to send email:", {
				to: options.to,
				subject: options.subject,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			throw new Error("Failed to send email");
		}
	}

	async sendVerificationEmail(
		email: string,
		token: string,
		firstName: string
	): Promise<void> {
		const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;

		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - KadaCare</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #2563eb; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KadaCare!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for signing up for KadaCare Health Systems. To complete your registration, please verify your email address by clicking the button below:</p>
              
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              
              <p>This verification link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with KadaCare, please ignore this email.</p>
              
              <p>Best regards,<br>The KadaCare Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 KadaCare Health Systems. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		const text = `
      Hi ${firstName},
      
      Thank you for signing up for KadaCare Health Systems. To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create an account with KadaCare, please ignore this email.
      
      Best regards,
      The KadaCare Team
    `;

		await this.sendEmail({
			to: email,
			subject: "Verify Your Email Address - KadaCare",
			html,
			text,
		});
	}

	async sendPasswordResetEmail(
		email: string,
		token: string,
		firstName: string
	): Promise<void> {
		const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - KadaCare</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #dc2626; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password for your KadaCare account. If you made this request, click the button below to reset your password:</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              
              <div class="warning">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </div>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>For security reasons, if you continue to receive these emails, please contact our support team.</p>
              
              <p>Best regards,<br>The KadaCare Security Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 KadaCare Health Systems. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

		const text = `
      Hi ${firstName},
      
      We received a request to reset your password for your KadaCare account. If you made this request, visit this link to reset your password:
      
      ${resetUrl}
      
      This password reset link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      
      Best regards,
      The KadaCare Security Team
    `;

		await this.sendEmail({
			to: email,
			subject: "Reset Your Password - KadaCare",
			html,
			text,
		});
	}

	async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
		const loginUrl = `${config.FRONTEND_URL}/login`;

		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to KadaCare - Account Verified</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #059669; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
            .features { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { margin: 15px 0; padding-left: 25px; position: relative; }
            .feature:before { content: "✓"; color: #059669; font-weight: bold; position: absolute; left: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to KadaCare!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Congratulations! Your email has been successfully verified and your KadaCare account is now active.</p>
              
              <div class="features">
                <h3>What you can do now:</h3>
                <div class="feature">Access your personal health dashboard</div>
                <div class="feature">Book appointments with healthcare providers</div>
                <div class="feature">Manage your medical records securely</div>
                <div class="feature">Connect with our healthcare network</div>
                <div class="feature">Track your health metrics and progress</div>
              </div>
              
              <p>Ready to get started? Click the button below to log in to your account:</p>
              
              <a href="${loginUrl}" class="button">Login to Your Account</a>
              
              <p>If you have any questions or need assistance, our support team is here to help. You can reach us at support@kadacare.com</p>
              
              <p>Thank you for choosing KadaCare for your healthcare needs!</p>
              
              <p>Best regards,<br>The KadaCare Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 KadaCare Health Systems. All rights reserved.</p>
              <p>Need help? Contact us at support@kadacare.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

		const text = `
      Hi ${firstName},
      
      Congratulations! Your email has been successfully verified and your KadaCare account is now active.
      
      What you can do now:
      ✓ Access your personal health dashboard
      ✓ Book appointments with healthcare providers
      ✓ Manage your medical records securely
      ✓ Connect with our healthcare network
      ✓ Track your health metrics and progress
      
      Ready to get started? Visit: ${loginUrl}
      
      If you have any questions or need assistance, our support team is here to help at support@kadacare.com
      
      Thank you for choosing KadaCare for your healthcare needs!
      
      Best regards,
      The KadaCare Team
    `;

		await this.sendEmail({
			to: email,
			subject: "🎉 Welcome to KadaCare - Your Account is Ready!",
			html,
			text,
		});
	}
}
