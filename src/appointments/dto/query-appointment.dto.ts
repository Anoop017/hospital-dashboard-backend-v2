import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Filter by doctor UUID' })
  @IsUUID()
  @IsOptional()
  readonly doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter by patient UUID' })
  @IsUUID()
  @IsOptional()
  readonly patientId?: string;
}
