import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  medication: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ example: 'Twice a day' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ example: 'Take after meals' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  issuedDate?: string;
}
