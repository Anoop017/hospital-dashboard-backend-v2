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
        where: { id: prescriptionId }
      });

      if (!prescription) {
        throw new NotFoundException(`Prescription with ID ${prescriptionId} not found`);
      }

      // Find the medicine by name (string matching)
      const medicine = await queryRunner.manager.findOne(Medicine, {
        where: { name: prescription.medication }
      });

      if (!medicine) {
        throw new BadRequestException(`Medicine ${prescription.medication} not found in pharmacy inventory`);
      }

      const deductionUnits = 1; 

      if (medicine.stockQuantity < deductionUnits) {
        throw new BadRequestException(`Not enough stock for medicine ${medicine.name}`);
      }

      medicine.stockQuantity -= deductionUnits;
      await queryRunner.manager.save(Medicine, medicine);

      // Status was removed from Prescription schema, so we just return it.
      const updatedPrescription = prescription;

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
