import { IsString, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Patient UUID' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Doctor UUID' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: '2026-08-15T10:00:00Z' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, example: 'Patient experiencing mild fever' })
  @IsOptional()
  @IsString()
  notes?: string;
}
