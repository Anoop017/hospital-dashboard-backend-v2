import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission } from './entities/admission.entity';
import { Bed } from '../beds/entities/bed.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { QueryAdmissionDto } from './dto/query-admission.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(Admission)
    private admissionsRepository: Repository<Admission>,
    @InjectRepository(Bed)
    private bedsRepository: Repository<Bed>,
  ) {}

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const admission = this.admissionsRepository.create(createAdmissionDto);
    const savedAdmission = await this.admissionsRepository.save(admission);

    // Auto mark bed as occupied if bedId is provided
    if (createAdmissionDto.bedId) {
      await this.bedsRepository.update(createAdmissionDto.bedId, { status: 'occupied' });
    }

    return savedAdmission;
  }

  async findAll(queryDto?: QueryAdmissionDto): Promise<PageDto<Admission>> {
    const qb = this.admissionsRepository
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('admission.admittingDoctor', 'admittingDoctor')
      .leftJoinAndSelect('admittingDoctor.user', 'doctorUser')
      .leftJoinAndSelect('admission.bed', 'bed')
      .leftJoinAndSelect('bed.ward', 'ward');

    if (queryDto?.patientId) {
      qb.andWhere('admission.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.status) {
      qb.andWhere('admission.status = :status', { status: queryDto.status });
    }

    if (queryDto?.wardId) {
      qb.andWhere('bed.wardId = :wardId', { wardId: queryDto.wardId });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(patientUser.firstName) LIKE LOWER(:search) OR LOWER(patientUser.lastName) LIKE LOWER(:search) OR LOWER(admission.reason) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('admission.admissionDate', queryDto?.sortOrder || 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [admissions, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(admissions, pageMetaDto);
  }

  async findMy(userId: number, queryDto?: QueryAdmissionDto): Promise<PageDto<Admission>> {
    const qb = this.admissionsRepository
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('admission.admittingDoctor', 'admittingDoctor')
      .leftJoinAndSelect('admittingDoctor.user', 'doctorUser')
      .leftJoinAndSelect('admission.bed', 'bed')
      .leftJoinAndSelect('bed.ward', 'ward')
      .where('(patient.userId = :userId OR admittingDoctor.userId = :userId)', { userId });

    if (queryDto?.status) {
      qb.andWhere('admission.status = :status', { status: queryDto.status });
    }

    qb.orderBy('admission.admissionDate', 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 20;
    qb.skip(skip).take(take);

    const [admissions, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(admissions, pageMetaDto);
  }

  async findOne(id: number, userId?: number, roles: string[] = []): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        admittingDoctor: { user: true },
        bed: { ward: true },
      },
    });

    if (!admission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }

    // Role-based ownership check
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('doctor') && !roles.includes('nurse') && !roles.includes('receptionist')) {
      if (admission.patient?.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this admission');
      }
    }

    return admission;
  }

  async update(id: number, updateAdmissionDto: UpdateAdmissionDto): Promise<Admission> {
    const admission = await this.findOne(id);
    const prevBedId = admission.bedId;

    this.admissionsRepository.merge(admission, updateAdmissionDto);
    const savedAdmission = await this.admissionsRepository.save(admission);

    // If status changed to discharged or dischargeDate set, free up the bed
    if (updateAdmissionDto.status === 'discharged' || updateAdmissionDto.dischargeDate) {
      if (savedAdmission.bedId) {
        await this.bedsRepository.update(savedAdmission.bedId, { status: 'available' });
      }
    } else if (updateAdmissionDto.bedId && updateAdmissionDto.bedId !== prevBedId) {
      // If bed changed, free old bed and occupy new bed
      if (prevBedId) {
        await this.bedsRepository.update(prevBedId, { status: 'available' });
      }
      await this.bedsRepository.update(updateAdmissionDto.bedId, { status: 'occupied' });
    }

    return savedAdmission;
  }

  async remove(id: number): Promise<void> {
    const admission = await this.findOne(id);
    if (admission.bedId) {
      await this.bedsRepository.update(admission.bedId, { status: 'available' });
    }
    await this.admissionsRepository.softRemove(admission);
  }
}
