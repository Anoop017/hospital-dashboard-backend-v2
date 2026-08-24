import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryMedicalRecordDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly patientId?: number;

  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly doctorId?: number;

  @ApiPropertyOptional({ description: 'Filter by diagnosis keyword' })
  @IsString()
  @IsOptional()
  readonly diagnosis?: string;
}
