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
    const prescription = this.prescriptionsRepository.create({
      patientId: createPrescriptionDto.patientId,
      doctorId: createPrescriptionDto.doctorId,
      appointmentId: createPrescriptionDto.appointmentId,
      notes: createPrescriptionDto.notes,
      items: createPrescriptionDto.items.map(item => ({
        medicineId: item.medicineId,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
      })),
    });

    return this.prescriptionsRepository.save(prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      relations: {
        patient: true,
        doctor: true,
        items: {
          medicine: true,
        }
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
        items: {
          medicine: true,
        }
      }
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({ 
      where: { id },
      relations: {
        patient: true,
        doctor: true,
        items: {
          medicine: true,
        }
      }
    });
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return prescription;
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    // Since items are nested, a simple Object.assign is usually not enough for items update
    // But for simplicity, we'll allow updating the top-level notes/status.
    if (updatePrescriptionDto.notes) prescription.notes = updatePrescriptionDto.notes;
    
    return this.prescriptionsRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionsRepository.softRemove(prescription);
  }
}
