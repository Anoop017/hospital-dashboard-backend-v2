import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBedDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Ward UUID' })
  @IsUUID()
  wardId: string;

  @ApiProperty({ example: 'Bed-01' })
  @IsString()
  bedNumber: string;

  @ApiPropertyOptional({ example: 'available' })
  @IsOptional()
  @IsString()
  @IsIn(['available', 'occupied', 'maintenance'])
  status?: string;
}
