import { ForbiddenException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { UsersService } from '../users/users.service';
import { CreatePatientWithUserDto } from './dto/create-patient-with-user.dto';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  async createWithUser(dto: CreatePatientWithUserDto): Promise<Patient> {
    dto.user.roles = [RoleEnum.PATIENT];
    const user = await this.usersService.createAdminUser(dto.user);
    const patientData = { ...dto.patient, userId: user.id };
    return this.create(patientData);
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientsRepository.findOne({
      where: { userId: createPatientDto.userId },
    });
    if (existing) {
      throw new ConflictException('Patient profile already exists for this user');
    }
    const patient = this.patientsRepository.create(createPatientDto);
    return this.patientsRepository.save(patient);
  }

  async getOverview(filter?: string): Promise<any[]> {
    let dateFilter = null;
    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = startOfDay;
    } else if (filter === 'weekly') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = startOfWeek;
    } else if (filter === 'monthly') {
      const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = startOfMonth;
    } else if (filter === 'yearly') {
      const startOfYear = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFilter = startOfYear;
    }

    const whereClause: any = {};
    if (dateFilter) {
      whereClause.createdAt = MoreThanOrEqual(dateFilter);
    }

    const patients = await this.patientsRepository.find({
      where: whereClause,
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const activeAdmissions = await this.dataSource
      .getRepository('Admission')
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.bed', 'bed')
      .leftJoinAndSelect('bed.ward', 'ward')
      .where('admission.status = :status', { status: 'admitted' })
      .getMany();

    const roomMap = new Map();
    activeAdmissions.forEach((a: any) => {
      if (a.bed && a.bed.ward) {
        roomMap.set(a.patientId, a.bed.ward.name);
      }
    });

    return patients
      .filter((p) => p.user !== null)
      .map((p, index) => {
        let age = null;
        if (p.dateOfBirth) {
          const dob = new Date(p.dateOfBirth);
          const ageDifMs = Date.now() - dob.getTime();
          const ageDate = new Date(ageDifMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        return {
          id: p.id,
          no: index + 1,
          name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
          room: roomMap.get(p.id) || 'Outpatient',
          age: age,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : null,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          status: p.status === 'active' ? 'Active' : 'Inactive',
          email: p.user?.email || '-',
          phone: p.user?.mobile || '-',
        };
      });
  }

  async findAll(queryDto?: QueryPatientDto): Promise<PageDto<Patient>> {
    const qb = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('patient.emergencyContacts', 'emergencyContacts')
      .leftJoinAndSelect('patient.allergies', 'allergies')
      .leftJoinAndSelect('patient.conditions', 'conditions');

    if (queryDto?.gender) {
      qb.andWhere('patient.gender = :gender', { gender: queryDto.gender });
    }

    if (queryDto?.bloodGroup) {
      qb.andWhere('patient.bloodGroup = :bloodGroup', { bloodGroup: queryDto.bloodGroup });
    }

    if (queryDto?.status) {
      qb.andWhere('patient.status = :status', { status: queryDto.status });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.mobile) LIKE LOWER(:search) OR LOWER(patient.address) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    const sortOrder = queryDto?.sortOrder || 'DESC';
    qb.orderBy('patient.createdAt', sortOrder);

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [patients, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(patients.filter((p) => p.user !== null), pageMetaDto);
  }

  async findOneByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { userId },
      relations: {
        user: true,
        emergencyContacts: true,
        allergies: true,
        conditions: true,
      },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with user ID ${userId} not found`);
    }
    return patient;
  }

  async findOne(id: string, userId?: string, roles: string[] = []): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: {
        user: true,
        emergencyContacts: true,
        allergies: true,
        conditions: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Role-based data ownership verification
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('receptionist') && !roles.includes('doctor') && !roles.includes('nurse')) {
      if (patient.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this patient profile');
      }
    }

    return patient;
  }

  async getPatientSummary(id: string) {
    const patient = await this.findOne(id);

    const appointments = await this.dataSource.getRepository('Appointment').find({
      where: { patientId: id },
      relations: { doctor: { user: true } },
      order: { appointmentDate: 'DESC' },
      take: 5,
    });

    const medicalRecords = await this.dataSource.getRepository('MedicalRecord').find({
      where: { patientId: id },
      relations: { doctor: { user: true } },
      order: { recordDate: 'DESC' },
      take: 5,
    });

    const prescriptions = await this.dataSource.getRepository('Prescription').find({
      where: { patientId: id },
      relations: { doctor: { user: true } },
      order: { issueDate: 'DESC' },
      take: 5,
    });

    const admissions = await this.dataSource.getRepository('Admission').find({
      where: { patientId: id },
      relations: { bed: { ward: true } },
      order: { admissionDate: 'DESC' },
      take: 3,
    });

    const bills = await this.dataSource.getRepository('Bill').find({
      where: { patientId: id },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      patient,
      timeline: {
        recentAppointments: appointments,
        recentMedicalRecords: medicalRecords,
        recentPrescriptions: prescriptions,
        admissionsHistory: admissions,
        recentBills: bills,
      },
    };
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    this.patientsRepository.merge(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await this.patientsRepository.softDelete(ids);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.softRemove(patient);
  }
}
