import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Prescription])],
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}
