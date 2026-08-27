import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface AppointmentEmailData {
  patientName: string;
  doctorName: string;
  doctorSpecialization?: string;
  appointmentDate: string;
  reason?: string;
  status: string;
  portalUrl?: string;
  appointmentId?: number;
}

export interface PasswordResetEmailData {
  name: string;
  resetLink: string;
  resetCode: string;
  expiresInMinutes: number;
}

function loadTemplate(filename: string): handlebars.TemplateDelegate {
  // Check multiple potential paths (for development in /src and build in /dist)
  const candidatePaths = [
    path.join(__dirname, filename),
    path.join(__dirname, 'templates', filename),
    path.join(process.cwd(), 'src', 'mail', 'templates', filename),
    path.join(process.cwd(), 'dist', 'mail', 'templates', filename),
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      const source = fs.readFileSync(filePath, 'utf-8');
      return handlebars.compile(source);
    }
  }

  throw new Error(`Handlebars template not found: ${filename}`);
}

// Precompile templates for high performance
let layoutTemplate: handlebars.TemplateDelegate;
let appointmentCreatedTemplate: handlebars.TemplateDelegate;
let appointmentStatusChangedTemplate: handlebars.TemplateDelegate;
let passwordResetTemplate: handlebars.TemplateDelegate;

function initTemplates() {
  if (!layoutTemplate) {
    layoutTemplate = loadTemplate('base-layout.hbs');
    appointmentCreatedTemplate = loadTemplate('appointment-created.hbs');
    appointmentStatusChangedTemplate = loadTemplate('appointment-status-changed.hbs');
    passwordResetTemplate = loadTemplate('password-reset.hbs');
  }
}

export function getAppointmentCreatedTemplate(data: AppointmentEmailData): string {
  initTemplates();
  const statusClass = data.status.toLowerCase().replace(/_/g, '-');
  const bodyHtml = appointmentCreatedTemplate({
    ...data,
    statusClass,
  });

  return layoutTemplate({
    title: `Appointment Scheduled - Dr. ${data.doctorName}`,
    preheader: `Appointment scheduled with Dr. ${data.doctorName} for ${data.appointmentDate}`,
    body: bodyHtml,
    year: new Date().getFullYear(),
  });
}

export function getAppointmentStatusChangedTemplate(data: AppointmentEmailData): string {
  initTemplates();
  const statusClass = data.status.toLowerCase().replace(/_/g, '-');
  const statusUpper = data.status.toUpperCase();
  const bodyHtml = appointmentStatusChangedTemplate({
    ...data,
    statusClass,
    statusUpper,
  });

  return layoutTemplate({
    title: `Appointment ${statusUpper} - Dr. ${data.doctorName}`,
    preheader: `Appointment status update: ${data.status} for Dr. ${data.doctorName}`,
    body: bodyHtml,
    year: new Date().getFullYear(),
  });
}

export function getPasswordResetTemplate(data: PasswordResetEmailData): string {
  initTemplates();
  const bodyHtml = passwordResetTemplate(data);

  return layoutTemplate({
    title: 'Password Reset Request',
    preheader: 'Password reset request for Hospital Care System',
    body: bodyHtml,
    year: new Date().getFullYear(),
  });
}
