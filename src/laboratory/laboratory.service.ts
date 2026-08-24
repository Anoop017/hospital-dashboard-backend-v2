import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { QueryLabTestDto } from './dto/query-lab-test.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LabTest } from './entities/lab-test.entity';
import { Repository } from 'typeorm';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(LabTest)
    private readonly labTestsRepository: Repository<LabTest>,
  ) {}

  async create(createLabTestDto: CreateLabTestDto): Promise<LabTest> {
    const labTest = this.labTestsRepository.create(createLabTestDto);
    return this.labTestsRepository.save(labTest);
  }

  async findAll(queryDto?: QueryLabTestDto): Promise<PageDto<LabTest>> {
    const qb = this.labTestsRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('test.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser');

    if (queryDto?.patientId) {
      qb.andWhere('test.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.doctorId) {
      qb.andWhere('test.doctorId = :doctorId', { doctorId: queryDto.doctorId });
    }

    if (queryDto?.status) {
      qb.andWhere('test.status = :status', { status: queryDto.status });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(patientUser.firstName) LIKE LOWER(:search) OR LOWER(patientUser.lastName) LIKE LOWER(:search) OR LOWER(test.testName) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('test.createdAt', queryDto?.sortOrder || 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [tests, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(tests, pageMetaDto);
  }

  async findMy(userId: number, queryDto?: QueryLabTestDto): Promise<PageDto<LabTest>> {
    const qb = this.labTestsRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('test.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .where('(patient.userId = :userId OR doctor.userId = :userId)', { userId });

    if (queryDto?.status) {
      qb.andWhere('test.status = :status', { status: queryDto.status });
    }

    if (queryDto?.search) {
      qb.andWhere('(LOWER(test.testName) LIKE LOWER(:search))', { search: `%${queryDto.search}%` });
    }

    qb.orderBy('test.createdAt', 'DESC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 20;
    qb.skip(skip).take(take);

    const [tests, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(tests, pageMetaDto);
  }

  async findOne(id: number, userId?: number, roles: string[] = []): Promise<LabTest> {
    const labTest = await this.labTestsRepository.findOne({
      where: { id },
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    if (!labTest) {
      throw new NotFoundException(`Lab test with ID ${id} not found`);
    }

    // Role-based ownership check
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('doctor') && !roles.includes('lab_technician') && !roles.includes('nurse')) {
      if (labTest.patient?.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this lab test');
      }
    }

    return labTest;
  }

  async update(id: number, updateLabTestDto: UpdateLabTestDto): Promise<LabTest> {
    const labTest = await this.findOne(id);
    Object.assign(labTest, updateLabTestDto);
    return this.labTestsRepository.save(labTest);
  }

  async remove(id: number): Promise<void> {
    const labTest = await this.findOne(id);
    await this.labTestsRepository.softRemove(labTest);
  }

  async getLabStats() {
    const total = await this.labTestsRepository.count();
    const pending = await this.labTestsRepository.count({ where: { status: 'pending' } });
    const completed = await this.labTestsRepository.count({ where: { status: 'completed' } });
    const cancelled = await this.labTestsRepository.count({ where: { status: 'cancelled' } });

    return {
      total,
      pending,
      completed,
      cancelled,
    };
  }
}
