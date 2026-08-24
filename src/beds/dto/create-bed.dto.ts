import { IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBedDto {
  @ApiProperty({ example: 1, description: 'Ward ID' })
  @Type(() => Number)
  @IsInt()
  wardId: number;

  @ApiProperty({ example: 'Bed-01' })
  @IsString()
  bedNumber: string;

  @ApiPropertyOptional({ example: 'available' })
  @IsOptional()
  @IsString()
  @IsIn(['available', 'occupied', 'maintenance'])
  status?: string;
}
