import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.MAIL_FROM || 'Hospital Care System <no-reply@hospital.com>',
  patientPortalUrl: process.env.PATIENT_PORTAL_URL || 'http://localhost:3000',
  adminPortalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3001',
}));
