import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export class QueryAppointmentDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: AppointmentStatus, description: 'Filter by appointment status' })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  readonly status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly doctorId?: number;

  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly patientId?: number;
}
