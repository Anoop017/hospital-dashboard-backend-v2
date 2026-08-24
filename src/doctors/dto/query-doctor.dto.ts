import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryDoctorDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly departmentId?: number;

  @ApiPropertyOptional({ description: 'Filter by specialization (e.g. Cardiology, Neurology)' })
  @IsString()
  @IsOptional()
  readonly specialization?: string;
}
