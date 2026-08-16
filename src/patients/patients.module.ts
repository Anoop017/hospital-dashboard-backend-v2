import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { PatientAllergy } from './entities/patient-allergy.entity';
import { PatientCondition } from './entities/patient-condition.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, EmergencyContact, PatientAllergy, PatientCondition]), UsersModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
