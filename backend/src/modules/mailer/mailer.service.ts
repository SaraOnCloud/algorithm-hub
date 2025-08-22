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
      this.logger.warn('EMAIL_USER/EMAIL_PASS no configurados: emails deshabilitados');
    }
  }

  isEnabled() {
    return !!this.transporter;
  }

  async sendVerificationEmail(to: string, token: string) {
    if (!this.transporter) return; // silencioso si no configurado
    const fromEmail = this.config.get<string>('EMAIL_FROM') || this.config.get<string>('EMAIL_USER') || 'no-reply@example.com';
    const fromName = this.config.get<string>('EMAIL_FROM_NAME');
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    const domain = this.domain || 'localhost';
    const verifyUrl = `https://api.${domain}/auth/verify?token=${encodeURIComponent(token)}`;

    const html = `<p>Confirma tu cuenta haciendo clic:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Si no creaste esta cuenta ignora este correo.</p>`;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Verifica tu cuenta',
        html,
      });
    } catch (err) {
      this.logger.error('Error enviando email verificación', err as Error);
    }
  }
}
