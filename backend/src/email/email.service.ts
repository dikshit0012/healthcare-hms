import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: parseInt(this.config.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.send(to, 'Verify Your Email', `
      <h2>Welcome to Healthcare HMS</h2>
      <p>Hi ${name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${url}" style="padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `);
  }

  async sendPasswordReset(to: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.send(to, 'Password Reset Request', `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${url}" style="padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `);
  }

  async sendAppointmentConfirmation(to: string, name: string, details: any) {
    await this.send(to, 'Appointment Confirmed', `
      <h2>Appointment Confirmed</h2>
      <p>Hi ${name},</p>
      <p>Your appointment with Dr. ${details.doctorName} is confirmed for ${details.date} at ${details.time}.</p>
      <p>Location: ${details.location || 'Main Branch'}</p>
    `);
  }

  async sendAppointmentReminder(to: string, name: string, details: any) {
    await this.send(to, 'Appointment Reminder', `
      <h2>Reminder: Upcoming Appointment</h2>
      <p>Hi ${name},</p>
      <p>You have an appointment with Dr. ${details.doctorName} on ${details.date} at ${details.time}.</p>
    `);
  }

  async sendLabResultNotification(to: string, name: string) {
    await this.send(to, 'Lab Results Available', `
      <h2>Lab Results Ready</h2>
      <p>Hi ${name},</p>
      <p>Your lab results are now available. Please log in to view them.</p>
    `);
  }

  async sendPaymentReceipt(to: string, name: string, amount: string) {
    await this.send(to, 'Payment Receipt', `
      <h2>Payment Received</h2>
      <p>Hi ${name},</p>
      <p>We received your payment of $${amount}. Thank you!</p>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.config.get('SMTP_USER')) {
      console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      return;
    }
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM'),
      to,
      subject,
      html,
    });
  }
}
