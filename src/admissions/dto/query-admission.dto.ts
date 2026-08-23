import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryAdmissionDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by patient UUID' })
  @IsUUID()
  @IsOptional()
  readonly patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. admitted, discharged)' })
  @IsString()
  @IsOptional()
  readonly status?: string;

  @ApiPropertyOptional({ description: 'Filter by ward UUID' })
  @IsUUID()
  @IsOptional()
  readonly wardId?: string;
}
