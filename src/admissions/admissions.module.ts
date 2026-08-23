import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { Admission } from './entities/admission.entity';
import { Bed } from '../beds/entities/bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admission, Bed])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
