import { PartialType } from '@nestjs/swagger';
import { CreateAdmissionDto } from './create-admission.dto';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionStatus } from '../../common/enums/admission-status.enum';

export class UpdateAdmissionDto extends PartialType(CreateAdmissionDto) {
  @ApiProperty({ required: false, enum: AdmissionStatus, example: AdmissionStatus.DISCHARGED })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @ApiProperty({ required: false, example: '2026-08-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;
}
