import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, In } from 'typeorm';
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
import { Bill } from '../billing/entities/bill.entity';
import { AdmissionStatus } from '../common/enums/admission-status.enum';

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
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
  ) {}

  async getSummary(userId: number, userRoles: any[]) {
    const roles: string[] = (userRoles || []).map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);

    // 1. DOCTOR ROLE
    if (roles.includes('doctor')) {
      const doctor = await this.doctorRepo.findOne({ where: { userId }, relations: { user: true } });
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
          select: { patientId: true },
        });

        const uniquePatientIds = new Set(appointments.map((a) => a.patientId).filter(Boolean));

        const upcomingAppointments = await this.appointmentRepo.find({
          where: {
            doctorId: doctor.id,
            appointmentDate: MoreThanOrEqual(new Date()),
          },
          relations: { patient: { user: true } },
          order: { appointmentDate: 'ASC' },
          take: 5,
        });

        return {
          role: 'doctor',
          doctorId: doctor.id,
          name: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor',
          specialization: doctor.specialization || 'General Medicine',
          todaysAppointments,
          pendingAppointments,
          myPatients: uniquePatientIds.size,
          upcomingAppointments: upcomingAppointments.map((a) => ({
            id: a.id,
            patientName: a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'N/A',
            patientPhone: a.patient?.user?.mobile,
            appointmentDate: a.appointmentDate,
            status: a.status,
            reason: a.reason,
          })),
        };
      }
    }

    // 2. PATIENT ROLE
    if (roles.includes('patient')) {
      const patient = await this.patientRepo.findOne({ where: { userId }, relations: { user: true } });
      if (patient) {
        const upcomingAppointmentsCount = await this.appointmentRepo.count({
          where: {
            patientId: patient.id,
            status: 'scheduled',
          },
        });

        const nextAppointment = await this.appointmentRepo.findOne({
          where: {
            patientId: patient.id,
            status: 'scheduled',
            appointmentDate: MoreThanOrEqual(new Date()),
          },
          relations: { doctor: { user: true } },
          order: { appointmentDate: 'ASC' },
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

        // Unpaid bills computation
        const unpaidBills = await this.billRepo.find({
          where: {
            patientId: patient.id,
            status: In(['unpaid', 'partially_paid']),
          },
        });

        let totalDue = 0;
        unpaidBills.forEach((b) => {
          totalDue += Math.max(0, Number(b.totalAmount) - Number(b.paidAmount || 0));
        });

        // Recent lab results
        const recentLabTests = await this.labTestRepo.find({
          where: { patientId: patient.id },
          order: { createdAt: 'DESC' },
          take: 3,
        });

        // Active admission check
        const activeAdmission = await this.admissionRepo.findOne({
          where: { patientId: patient.id, status: AdmissionStatus.ADMITTED },
          relations: { bed: { ward: true } },
        });

        return {
          role: 'patient',
          patientId: patient.id,
          name: patient.user ? `${patient.user.firstName} ${patient.user.lastName}` : 'Patient',
          bloodGroup: patient.bloodGroup,
          counts: {
            upcomingAppointments: upcomingAppointmentsCount,
            totalMedicalRecords,
            totalPrescriptions,
            totalLabTests,
            unpaidBillsCount: unpaidBills.length,
          },
          billingOverview: {
            unpaidBillsCount: unpaidBills.length,
            totalDueAmount: totalDue,
          },
          nextAppointment: nextAppointment
            ? {
                id: nextAppointment.id,
                doctorName: nextAppointment.doctor?.user
                  ? `Dr. ${nextAppointment.doctor.user.firstName} ${nextAppointment.doctor.user.lastName}`
                  : 'Assigned Doctor',
                specialization: nextAppointment.doctor?.specialization || 'General',
                appointmentDate: nextAppointment.appointmentDate,
                reason: nextAppointment.reason,
                status: nextAppointment.status,
              }
            : null,
          activeAdmission: activeAdmission
            ? {
                id: activeAdmission.id,
                admissionDate: activeAdmission.admissionDate,
                wardName: activeAdmission.bed?.ward?.name || 'General Ward',
                bedNumber: activeAdmission.bed?.bedNumber || 'N/A',
              }
            : null,
          recentLabTests: recentLabTests.map((lt) => ({
            id: lt.id,
            testName: lt.testName,
            status: lt.status,
            testDate: lt.testDate || lt.createdAt,
            result: lt.result,
          })),
        };
      }
    }

    // 3. ADMIN / SUPER_ADMIN ROLE
    if (roles.includes('admin') || roles.includes('super_admin')) {
      const patientsTotal = await this.patientRepo.count();
      const patientsPct = await this.getPercentageChange(this.patientRepo);

      const doctorsTotal = await this.doctorRepo.count();
      const doctorsPct = await this.getPercentageChange(this.doctorRepo);

      const staffTotal = await this.staffRepo.count();

      const bedsTotal = await this.bedRepo.count();
      const bedsAvailable = await this.bedRepo.count({ where: { status: 'available' } });
      const bedsOccupied = bedsTotal - bedsAvailable;

      // Real Bed breakdown by ward type
      const bedsWithWards = await this.bedRepo.find({ relations: { ward: true } });
      let privateBeds = 0;
      let generalBeds = 0;
      let icuBeds = 0;

      bedsWithWards.forEach((bed) => {
        if (!bed.ward) return;
        const wt = (bed.ward.type || '').toLowerCase();
        if (wt.includes('private')) privateBeds++;
        else if (wt.includes('icu')) icuBeds++;
        else generalBeds++;
      });

      // Real Revenue aggregation
      const revenueRaw = await this.billRepo
        .createQueryBuilder('bill')
        .select('SUM(bill.paidAmount)', 'paid')
        .addSelect('SUM(bill.totalAmount)', 'total')
        .getRawOne();

      const totalRevenue = parseFloat(revenueRaw?.paid || '0');
      const totalBilled = parseFloat(revenueRaw?.total || '0');
      const pendingReceivables = Math.max(0, totalBilled - totalRevenue);

      // Today's appointments count
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysAppointments = await this.appointmentRepo.count({
        where: { appointmentDate: Between(startOfDay, endOfDay) },
      });

      const upcomingAppointments = await this.appointmentRepo.find({
        where: { appointmentDate: MoreThanOrEqual(new Date()) },
        relations: { patient: { user: true }, doctor: { user: true } },
        order: { appointmentDate: 'ASC' },
        take: 5,
      });

      // Real 7-day appointment chart trend
      const chartLabels: string[] = [];
      const chartData: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const count = await this.appointmentRepo.count({
          where: { appointmentDate: Between(dayStart, dayEnd) },
        });

        chartLabels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }));
        chartData.push(count);
      }

      return {
        role: 'admin',
        stats: {
          patients: { total: patientsTotal, percentageChange: patientsPct },
          doctors: { total: doctorsTotal, percentageChange: doctorsPct },
          staff: { total: staffTotal },
          appointmentsToday: todaysAppointments,
          beds: {
            total: bedsTotal,
            available: bedsAvailable,
            occupied: bedsOccupied,
            occupancyRate: bedsTotal > 0 ? Number(((bedsOccupied / bedsTotal) * 100).toFixed(1)) : 0,
            breakdown: { private: privateBeds, general: generalBeds, icu: icuBeds },
          },
          financials: {
            totalRevenue,
            totalBilled,
            pendingReceivables,
          },
        },
        appointmentTrendChart: {
          labels: chartLabels,
          data: chartData,
        },
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          patientName: a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'N/A',
          doctorName: a.doctor?.user ? `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}` : 'N/A',
          date: a.appointmentDate,
          status: a.status,
        })),
      };
    }

    // 4. DEFAULT STAFF / RECEPTIONIST ROLE
    const totalPatients = await this.patientRepo.count();
    const totalDoctors = await this.doctorRepo.count();
    const totalAdmissions = await this.admissionRepo.count();
    const availableBeds = await this.bedRepo.count({ where: { status: 'available' } });

    return {
      role: 'staff',
      totalPatients,
      totalDoctors,
      totalAdmissions,
      availableBeds,
    };
  }

  async getAdminAnalytics(period: 'day' | 'week' | 'month' = 'week') {
    const daysCount = period === 'day' ? 1 : period === 'month' ? 30 : 7;
    const labels: string[] = [];
    const appointmentsData: number[] = [];
    const admissionsData: number[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const aptCount = await this.appointmentRepo.count({
        where: { appointmentDate: Between(dayStart, dayEnd) },
      });
      const admCount = await this.admissionRepo.count({
        where: { admissionDate: Between(dayStart, dayEnd) },
      });

      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      appointmentsData.push(aptCount);
      admissionsData.push(admCount);
    }

    return {
      period,
      labels,
      datasets: [
        { label: 'Appointments', data: appointmentsData },
        { label: 'Admissions', data: admissionsData },
      ],
    };
  }

  private async getPercentageChange(repo: Repository<any>, dateField: string = 'createdAt') {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    const currentPeriodCount = await repo.count({ where: { [dateField]: MoreThanOrEqual(lastMonthStart) } });
    const previousPeriodCount = await repo.count({ where: { [dateField]: Between(twoMonthsAgoStart, lastMonthStart) } });

    if (previousPeriodCount === 0) return currentPeriodCount > 0 ? 100 : 0;
    return Number((((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100).toFixed(1));
  }
}
