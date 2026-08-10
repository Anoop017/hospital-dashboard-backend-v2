import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { Admission } from './entities/admission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admission])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
