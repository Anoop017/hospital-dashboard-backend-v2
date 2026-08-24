import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStaffDto {
  @ApiProperty({ example: 1, description: 'Linked User ID' })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiPropertyOptional({ example: 1, description: 'Department ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiProperty({ example: 'Senior Nurse' })
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
