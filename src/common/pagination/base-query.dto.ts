import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto, Order } from './page-options.dto';

export class BaseQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Full-text search keyword across available fields' })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', default: 'createdAt' })
  @IsOptional()
  @IsString()
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: Order, default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  readonly sortOrder?: Order = Order.DESC;

  @ApiPropertyOptional({ description: 'Filter records starting from this ISO date (e.g. 2026-01-01)' })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @ApiPropertyOptional({ description: 'Filter records ending on this ISO date (e.g. 2026-12-31)' })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}
