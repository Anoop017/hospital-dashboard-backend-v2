import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Filter bills by patient UUID' })
  @IsUUID()
  @IsOptional()
  readonly patientId?: string;

  @ApiPropertyOptional({ description: 'Filter bills by admission UUID' })
  @IsUUID()
  @IsOptional()
  readonly admissionId?: string;

  @ApiPropertyOptional({ description: 'Filter bills by appointment UUID' })
  @IsUUID()
  @IsOptional()
  readonly appointmentId?: string;
}
