import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = this.medicalRecordsRepository.create(createMedicalRecordDto);
    return this.medicalRecordsRepository.save(medicalRecord);
  }

  async findAll(queryDto?: QueryMedicalRecordDto): Promise<PageDto<MedicalRecord>> {
    const qb = this.medicalRecordsRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('record.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser');

    if (queryDto?.patientId) {
      qb.andWhere('record.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.doctorId) {
      qb.andWhere('record.doctorId = :doctorId', { doctorId: queryDto.doctorId });
    }

    if (queryDto?.diagnosis) {
      qb.andWhere('LOWER(record.diagnosis) LIKE LOWER(:diagnosis)', { diagnosis: `%${queryDto.diagnosis}%` });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(patientUser.firstName) LIKE LOWER(:search) OR LOWER(patientUser.lastName) LIKE LOWER(:search) OR LOWER(record.diagnosis) LIKE LOWER(:search) OR LOWER(record.treatment) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('record.createdAt', queryDto?.sortOrder || 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [records, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(records, pageMetaDto);
  }

  async findMy(userId: string, queryDto?: QueryMedicalRecordDto): Promise<PageDto<MedicalRecord>> {
    const qb = this.medicalRecordsRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('record.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .where('(patient.userId = :userId OR doctor.userId = :userId)', { userId });

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(record.diagnosis) LIKE LOWER(:search) OR LOWER(record.treatment) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('record.createdAt', 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 20;
    qb.skip(skip).take(take);

    const [records, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(records, pageMetaDto);
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      where: { patientId },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string, roles: string[] = []): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    // Role-based ownership check
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('doctor') && !roles.includes('nurse')) {
      if (medicalRecord.patient?.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this medical record');
      }
    }

    return medicalRecord;
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id);
    this.medicalRecordsRepository.merge(medicalRecord, updateMedicalRecordDto);
    return this.medicalRecordsRepository.save(medicalRecord);
  }

  async remove(id: string): Promise<void> {
    const medicalRecord = await this.findOne(id);
    await this.medicalRecordsRepository.softRemove(medicalRecord);
  }
}
