import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked User UUID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 'LIC123456789' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({ example: 150.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;
}
