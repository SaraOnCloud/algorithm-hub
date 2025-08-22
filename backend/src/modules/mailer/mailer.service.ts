import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private domain: string | null;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('EMAIL_PASS');
    this.domain = this.config.get<string>('DOMAIN');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('EMAIL_USER/EMAIL_PASS not configured: emails disabled');
    }
  }

  isEnabled() {
    return !!this.transporter;
  }

  async sendVerificationEmail(to: string, token: string) {
    if (!this.transporter) return; // silent if disabled
    const fromEmail = this.config.get<string>('EMAIL_FROM') || this.config.get<string>('EMAIL_USER') || 'no-reply@example.com';
    const fromName = this.config.get<string>('EMAIL_FROM_NAME');
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    const domain = this.domain || 'localhost';
    // Base URL: same domain + prefix /api/v1
    const baseUrl = domain === 'localhost'
      ? 'http://localhost:3000'
      : `https://${domain}`;
    const verifyUrl = `${baseUrl}/api/v1/auth/verify?token=${encodeURIComponent(token)}`;

    const html = `<p>Please confirm your account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>If you did not create this account you can ignore this email.</p>`;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Verify your account',
        html,
      });
    } catch (err) {
      this.logger.error('Error sending verification email', err as Error);
    }
  }
}
