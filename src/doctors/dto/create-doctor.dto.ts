import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @ApiProperty({ example: 1, description: 'Linked User ID' })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 'LIC123456789' })
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;
}
