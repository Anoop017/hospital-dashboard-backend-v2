import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty({ example: 'Viral Fever' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'High temperature, headache' })
  @IsString()
  symptoms: string;

  @ApiProperty({ example: 'Prescribed paracetamol' })
  @IsString()
  treatment: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString() // Can also use @IsDateString() if preferred
  recordDate?: Date;
}
