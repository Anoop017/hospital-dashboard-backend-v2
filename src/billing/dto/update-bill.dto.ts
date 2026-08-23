import { PartialType } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillStatusFilter } from './query-bill.dto';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @ApiPropertyOptional({ enum: BillStatusFilter, example: BillStatusFilter.PAID })
  @IsOptional()
  @IsEnum(BillStatusFilter)
  status?: BillStatusFilter;
}
