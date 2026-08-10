import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked User UUID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false, description: 'Department UUID' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ example: 'Senior Nurse' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ example: '2026-08-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
