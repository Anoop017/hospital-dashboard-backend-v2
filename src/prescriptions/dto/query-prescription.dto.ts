import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryPrescriptionDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by patient UUID' })
  @IsUUID()
  @IsOptional()
  readonly patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor UUID' })
  @IsUUID()
  @IsOptional()
  readonly doctorId?: string;
}
