import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryLabTestDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by patient UUID' })
  @IsUUID()
  @IsOptional()
  readonly patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor UUID' })
  @IsUUID()
  @IsOptional()
  readonly doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. pending, completed, cancelled)' })
  @IsString()
  @IsOptional()
  readonly status?: string;
}
