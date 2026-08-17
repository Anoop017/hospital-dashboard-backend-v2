import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';

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

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      relations: {
        patient: { user: true },
        doctor: { user: true },
      }
    });
  }

  async findMy(userId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: [
        { patient: { userId } },
        { doctor: { userId } }
      ],
      relations: {
        patient: { user: true },
        doctor: { user: true },
      }
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({ 
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      }
    });
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return prescription;
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    this.prescriptionsRepository.merge(prescription, updatePrescriptionDto);
    return this.prescriptionsRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionsRepository.softRemove(prescription);
  }
}
