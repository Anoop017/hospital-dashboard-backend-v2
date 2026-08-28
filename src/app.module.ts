import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { StaffModule } from './staff/staff.module';
import { DepartmentsModule } from './departments/departments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { WardsModule } from './wards/wards.module';
import { BedsModule } from './beds/beds.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicinesModule } from './medicines/medicines.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { BillingModule } from './billing/billing.module';
import { PaymentsModule } from './payments/payments.module';
import { InsuranceModule } from './insurance/insurance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, UsersModule, RolesModule, PermissionsModule, PatientsModule, DoctorsModule, StaffModule, DepartmentsModule, AppointmentsModule, WardsModule, BedsModule, AdmissionsModule, MedicalRecordsModule, PrescriptionsModule, MedicinesModule, PharmacyModule, LaboratoryModule, BillingModule, PaymentsModule, InsuranceModule, NotificationsModule, AuditLogsModule, DashboardModule, HealthModule, UploadsModule, MailModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
