import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { LabTest } from '../laboratory/entities/lab-test.entity';
import { Admission } from '../admissions/entities/admission.entity';
import { Bed } from '../beds/entities/bed.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private medicalRecordRepo: Repository<MedicalRecord>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(LabTest) private labTestRepo: Repository<LabTest>,
    @InjectRepository(Admission) private admissionRepo: Repository<Admission>,
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
  ) {}

  async getSummary(userId: string, userRoles: any[]) {
    const roles: string[] = (userRoles || []).map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);

    if (roles.includes('doctor')) {
      const doctor = await this.doctorRepo.findOne({ where: { userId } });
      if (doctor) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysAppointments = await this.appointmentRepo.count({
          where: {
            doctorId: doctor.id,
            appointmentDate: Between(startOfDay, endOfDay),
          },
        });

        const pendingAppointments = await this.appointmentRepo.count({
          where: {
            doctorId: doctor.id,
            status: 'scheduled',
          },
        });

        const appointments = await this.appointmentRepo.find({
          where: { doctorId: doctor.id },
          select: {patientId: true,},
        });

        const uniquePatientIds = new Set(appointments.map((a) => a.patientId).filter(Boolean));

        return {
          role: 'doctor',
          todaysAppointments,
          pendingAppointments,
          myPatients: uniquePatientIds.size,
          specialization: doctor.specialization || 'General',
        };
      }
    }

    if (roles.includes('patient')) {
      const patient = await this.patientRepo.findOne({ where: { userId } });
      if (patient) {
        const upcomingAppointments = await this.appointmentRepo.count({
          where: {
            patientId: patient.id,
            status: 'scheduled',
          },
        });

        const totalMedicalRecords = await this.medicalRecordRepo.count({
          where: { patientId: patient.id },
        });

        const totalPrescriptions = await this.prescriptionRepo.count({
          where: { patientId: patient.id },
        });

        const totalLabTests = await this.labTestRepo.count({
          where: { patientId: patient.id },
        });

        return {
          role: 'patient',
          upcomingAppointments,
          totalMedicalRecords,
          totalPrescriptions,
          totalLabTests,
        };
      }
    }

    // Default to Staff / Nurse / Admin summary
    const totalPatients = await this.patientRepo.count();
    const totalDoctors = await this.doctorRepo.count();
    const totalAdmissions = await this.admissionRepo.count();
    const availableBeds = await this.bedRepo.count({
      where: { status: 'available' },
    });

    return {
      role: 'staff',
      totalPatients,
      totalDoctors,
      totalAdmissions,
      availableBeds,
    };
  }
}
