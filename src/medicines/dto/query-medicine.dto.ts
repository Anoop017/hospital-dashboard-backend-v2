import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryMedicineDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category (e.g. Antibiotics, Analgesics)' })
  @IsString()
  @IsOptional()
  readonly category?: string;

  @ApiPropertyOptional({ description: 'Filter medicines with low stock (<= 20 units)' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  readonly lowStock?: boolean;
}
