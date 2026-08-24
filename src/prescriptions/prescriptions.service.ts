import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionsRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const prescription = this.prescriptionsRepository.create(createPrescriptionDto);
    return this.prescriptionsRepository.save(prescription);
  }

  async findAll(queryDto?: QueryPrescriptionDto): Promise<PageDto<Prescription>> {
    const qb = this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('prescription.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser');

    if (queryDto?.patientId) {
      qb.andWhere('prescription.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.doctorId) {
      qb.andWhere('prescription.doctorId = :doctorId', { doctorId: queryDto.doctorId });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(patientUser.firstName) LIKE LOWER(:search) OR LOWER(patientUser.lastName) LIKE LOWER(:search) OR LOWER(prescription.medication) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('prescription.createdAt', queryDto?.sortOrder || 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [prescriptions, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(prescriptions, pageMetaDto);
  }

  async findMy(userId: number, queryDto?: QueryPrescriptionDto): Promise<PageDto<Prescription>> {
    const qb = this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('prescription.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .where('(patient.userId = :userId OR doctor.userId = :userId)', { userId });

    if (queryDto?.search) {
      qb.andWhere('(LOWER(prescription.medication) LIKE LOWER(:search))', { search: `%${queryDto.search}%` });
    }

    qb.orderBy('prescription.createdAt', 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 20;
    qb.skip(skip).take(take);

    const [prescriptions, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(prescriptions, pageMetaDto);
  }

  async findOne(id: number, userId?: number, roles: string[] = []): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Role-based ownership check
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('doctor') && !roles.includes('nurse') && !roles.includes('pharmacist')) {
      if (prescription.patient?.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this prescription');
      }
    }

    return prescription;
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    this.prescriptionsRepository.merge(prescription, updatePrescriptionDto);
    return this.prescriptionsRepository.save(prescription);
  }

  async remove(id: number): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionsRepository.softRemove(prescription);
  }
}
