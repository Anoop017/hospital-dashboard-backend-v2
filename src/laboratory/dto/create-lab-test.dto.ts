import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLabTestDto {
  @ApiProperty({ example: 1, description: 'Patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({ example: 1, description: 'Doctor ID' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiProperty({ example: 'Blood Test' })
  @IsString()
  @IsNotEmpty()
  testType: string;

  @ApiPropertyOptional({ example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Hemoglobin: 14g/dL' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  testDate?: Date;

  @ApiPropertyOptional({ example: 'https://storage.example.com/reports/123.pdf' })
  @IsString()
  @IsOptional()
  reportUrl?: string;
}
