import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicinesRepository: Repository<Medicine>,
    @InjectRepository(Prescription)
    private readonly prescriptionsRepository: Repository<Prescription>,
    private readonly dataSource: DataSource,
  ) {}

  async fulfillPrescription(prescriptionId: string): Promise<Prescription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prescription = await queryRunner.manager.findOne(Prescription, { 
        where: { id: prescriptionId },
        relations: { items: { medicine: true } }
      });

      if (!prescription) {
        throw new NotFoundException(`Prescription with ID ${prescriptionId} not found`);
      }

      if (prescription.status === 'fulfilled') {
        throw new BadRequestException('Prescription is already fulfilled');
      }

      for (const item of prescription.items) {
        const medicine = item.medicine;
        // Simple 1-to-1 deduction for now (assuming dosage strings map to 1 unit per item)
        // In a real scenario, you'd calculate exact units based on frequency * duration.
        const deductionUnits = 1; 

        if (medicine.stockQuantity < deductionUnits) {
          throw new BadRequestException(`Not enough stock for medicine ${medicine.name}`);
        }

        medicine.stockQuantity -= deductionUnits;
        await queryRunner.manager.save(Medicine, medicine);
      }

      prescription.status = 'fulfilled';
      const updatedPrescription = await queryRunner.manager.save(Prescription, prescription);

      await queryRunner.commitTransaction();
      return updatedPrescription;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
