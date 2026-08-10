import { IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdmissionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Patient UUID' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Admitting Doctor UUID' })
  @IsUUID()
  admittingDoctorId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bed UUID' })
  @IsUUID()
  bedId: string;

  @ApiProperty({ example: '2026-08-15T10:00:00Z' })
  @IsDateString()
  admissionDate: string;

  @ApiProperty({ example: 'Severe appendicitis' })
  @IsString()
  reason: string;
}
