import { IsNumber, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBillDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @ApiPropertyOptional({ example: 1, description: 'Admission ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  admissionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Appointment ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  appointmentId?: number;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsDateString()
  dueDate: string;
}
