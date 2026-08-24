import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export enum BillStatusFilter {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export class QueryBillDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: BillStatusFilter, description: 'Filter bills by payment status' })
  @IsEnum(BillStatusFilter)
  @IsOptional()
  readonly status?: BillStatusFilter;

  @ApiPropertyOptional({ description: 'Filter bills by patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly patientId?: number;

  @ApiPropertyOptional({ description: 'Filter bills by admission ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly admissionId?: number;

  @ApiPropertyOptional({ description: 'Filter bills by appointment ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly appointmentId?: number;
}
