import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

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
