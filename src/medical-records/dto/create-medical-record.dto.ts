import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  patientId: number;

  @ApiPropertyOptional({ example: 1, description: 'Doctor ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @ApiProperty({ example: 'Viral Fever' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'High temperature, headache' })
  @IsString()
  symptoms: string;

  @ApiProperty({ example: 'Prescribed paracetamol' })
  @IsString()
  treatment: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  recordDate?: Date;
}
