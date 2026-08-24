import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryAdmissionDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly patientId?: number;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. admitted, discharged)' })
  @IsString()
  @IsOptional()
  readonly status?: string;

  @ApiPropertyOptional({ description: 'Filter by ward ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly wardId?: number;
}
