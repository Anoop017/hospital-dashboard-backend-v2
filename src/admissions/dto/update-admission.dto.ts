import { PartialType } from '@nestjs/swagger';
import { CreateAdmissionDto } from './create-admission.dto';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdmissionDto extends PartialType(CreateAdmissionDto) {
  @ApiProperty({ required: false, example: 'discharged' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, example: '2026-08-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;
}
