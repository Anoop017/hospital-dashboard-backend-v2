import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  admissionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsDateString()
  dueDate: string;
}
