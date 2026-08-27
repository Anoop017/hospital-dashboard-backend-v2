import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  AppointmentEmailData,
  PasswordResetEmailData,
  getAppointmentCreatedTemplate,
  getAppointmentStatusChangedTemplate,
  getPasswordResetTemplate,
} from './templates/email-templates';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly defaultFrom: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host') || process.env.SMTP_HOST;
    const port = this.configService.get<number>('mail.port') || parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = this.configService.get<boolean>('mail.secure') ?? (port === 465);
    const user = this.configService.get<string>('mail.user') || process.env.SMTP_USER;
    const pass = this.configService.get<string>('mail.pass') || process.env.SMTP_PASS;
    this.defaultFrom =
      this.configService.get<string>('mail.from') ||
      process.env.MAIL_FROM ||
      'Hospital Care System <no-reply@hospital.com>';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.isConfigured = true;
    } else {
      this.logger.warn('SMTP credentials not provided. Mail service will log emails to console in development mode.');
      this.isConfigured = false;
    }
  }

  async onModuleInit() {
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.verify();
        this.logger.log('✅ SMTP Transporter connected successfully and ready to deliver emails.');
      } catch (error) {
        this.logger.error('❌ Failed to verify SMTP Transporter connection:', error);
      }
    }
  }

  /**
   * Generic send email method
   */
  async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    if (!recipients) {
      this.logger.warn('Email send skipped: No recipient specified.');
      return { success: false, error: 'No recipient provided' };
    }

    if (!this.transporter || !this.isConfigured) {
      this.logger.log(`[SIMULATED EMAIL] To: ${recipients} | Subject: ${options.subject}`);
      return { success: true, messageId: 'simulated-local-id' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`📧 Email delivered to [${recipients}] with Subject: "${options.subject}" (MsgID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to [${recipients}]: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment scheduled / created email
   */
  async sendAppointmentCreatedEmail(to: string, data: AppointmentEmailData): Promise<void> {
    const html = getAppointmentCreatedTemplate(data);
    await this.sendMail({
      to,
      subject: `🏥 Appointment Scheduled - Dr. ${data.doctorName} on ${data.appointmentDate}`,
      html,
    });
  }

  /**
   * Send appointment status change notification
   */
  async sendAppointmentStatusChangedEmail(to: string, data: AppointmentEmailData): Promise<void> {
    const html = getAppointmentStatusChangedTemplate(data);
    await this.sendMail({
      to,
      subject: `🏥 Appointment ${data.status.toUpperCase()} - Dr. ${data.doctorName}`,
      html,
    });
  }

  /**
   * Send password reset request email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const html = getPasswordResetTemplate(data);
    await this.sendMail({
      to,
      subject: '🔒 Reset Your Hospital Care System Password',
      html,
    });
  }
}
