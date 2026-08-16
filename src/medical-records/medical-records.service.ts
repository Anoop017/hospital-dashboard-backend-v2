import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const record = this.medicalRecordsRepository.create(createMedicalRecordDto);
    return this.medicalRecordsRepository.save(record);
  }

  async findAll(): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      relations: {
        patient: { user: true },
        doctor: { user: true },
        appointment: true,
      },
    });
  }

  async findMy(userId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      where: [
        { patient: { userId } },
        { doctor: { userId } }
      ],
      relations: {
        patient: { user: true },
        doctor: { user: true },
        appointment: true,
      },
    });
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true },
        appointment: true,
      },
    });
    if (!record) {
      throw new NotFoundException(`Medical Record with ID ${id} not found`);
    }
    return record;
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      where: { patientId },
      relations: {
        doctor: { user: true },
        appointment: true,
      },
    });
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const record = await this.findOne(id);
    this.medicalRecordsRepository.merge(record, updateMedicalRecordDto);
    return this.medicalRecordsRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.medicalRecordsRepository.softRemove(record);
  }
}
