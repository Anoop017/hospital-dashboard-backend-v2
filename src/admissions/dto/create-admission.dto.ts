import { IsString, IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AdmissionStatus } from '../../common/enums/admission-status.enum';

export class CreateAdmissionDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @ApiProperty({ example: 1, description: 'Admitting Doctor ID' })
  @Type(() => Number)
  @IsInt()
  admittingDoctorId: number;

  @ApiProperty({ example: 1, description: 'Bed ID' })
  @Type(() => Number)
  @IsInt()
  bedId: number;

  @ApiProperty({ example: '2026-08-15T10:00:00Z' })
  @IsDateString()
  admissionDate: string;

  @ApiProperty({ example: 'Severe appendicitis' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, enum: AdmissionStatus, example: AdmissionStatus.ADMITTED })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;
}
