import { IsString, IsNotEmpty, IsUUID, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionItemDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ example: '1 pill' })
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
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiPropertyOptional({ example: 'uuid-here' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ example: 'Take after meals' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreatePrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}
