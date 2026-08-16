import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { LabTest } from '../laboratory/entities/lab-test.entity';
import { Admission } from '../admissions/entities/admission.entity';
import { Bed } from '../beds/entities/bed.entity';

import { User } from '../users/entities/user.entity';
import { Ward } from '../wards/entities/ward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Doctor,
      Staff,
      Appointment,
      MedicalRecord,
      Prescription,
      LabTest,
      Admission,
      Bed,
      User,
      Ward,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
