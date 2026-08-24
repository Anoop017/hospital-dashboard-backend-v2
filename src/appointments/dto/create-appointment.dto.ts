import { IsString, IsInt, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @ApiProperty({ example: 1, description: 'Doctor ID' })
  @Type(() => Number)
  @IsInt()
  doctorId: number;

  @ApiProperty({ example: '2026-08-15T10:00:00Z' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Patient experiencing mild fever' })
  @IsOptional()
  @IsString()
  notes?: string;
}
