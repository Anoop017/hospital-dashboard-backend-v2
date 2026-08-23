import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryDoctorDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by department UUID' })
  @IsUUID()
  @IsOptional()
  readonly departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by specialization (e.g. Cardiology, Neurology)' })
  @IsString()
  @IsOptional()
  readonly specialization?: string;
}
