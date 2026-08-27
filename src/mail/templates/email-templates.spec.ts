import {
  getAppointmentCreatedTemplate,
  getAppointmentStatusChangedTemplate,
  getPasswordResetTemplate,
} from './email-templates';

describe('Handlebars Email Templates', () => {
  it('should render appointment created template correctly', () => {
    const html = getAppointmentCreatedTemplate({
      patientName: 'John Doe',
      doctorName: 'Sarah Jenkins',
      doctorSpecialization: 'Cardiology',
      appointmentDate: 'Aug 27, 2026, 10:00 AM',
      reason: 'Regular Health Checkup',
      status: 'scheduled',
      portalUrl: 'http://localhost:3000/portal/appointments',
    });

    expect(html).toContain('John Doe');
    expect(html).toContain('Dr. Sarah Jenkins');
    expect(html).toContain('Cardiology');
    expect(html).toContain('Aug 27, 2026, 10:00 AM');
    expect(html).toContain('Regular Health Checkup');
    expect(html).toContain('http://localhost:3000/portal/appointments');
  });

  it('should render appointment status changed template correctly', () => {
    const html = getAppointmentStatusChangedTemplate({
      patientName: 'Jane Smith',
      doctorName: 'Robert Vance',
      appointmentDate: 'Aug 28, 2026, 02:30 PM',
      status: 'confirmed',
      portalUrl: 'http://localhost:3000/portal/appointments',
    });

    expect(html).toContain('Jane Smith');
    expect(html).toContain('Dr. Robert Vance');
    expect(html).toContain('CONFIRMED');
    expect(html).toContain('badge-confirmed');
  });

  it('should render password reset template correctly', () => {
    const html = getPasswordResetTemplate({
      name: 'Alice Brown',
      resetLink: 'http://localhost:3000/reset-password?token=abcdef123456',
      resetCode: 'ABCDEF',
      expiresInMinutes: 15,
    });

    expect(html).toContain('Alice Brown');
    expect(html).toContain('http://localhost:3000/reset-password?token=abcdef123456');
    expect(html).toContain('ABCDEF');
    expect(html).toContain('15 minutes');
  });
});
