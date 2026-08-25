import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryNotificationDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by read status (true/false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  readonly isRead?: boolean;

  @ApiPropertyOptional({ description: 'Filter by notification type' })
  @IsOptional()
  @IsString()
  readonly type?: string;
}
