import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';

export class QueryAuditLogDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter logs by admin category (true: Admin/SuperAdmin logs, false: Doctors/Patients/Staff logs)',
    type: Boolean,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  readonly isAdmin?: boolean;

  @ApiPropertyOptional({ description: 'Filter by module name (e.g. appointments, doctors, auth, prescriptions)' })
  @IsOptional()
  @IsString()
  readonly module?: string;

  @ApiPropertyOptional({ description: 'Filter by action name (e.g. APPOINTMENT_COMPLETED, USER_LOGIN)' })
  @IsOptional()
  @IsString()
  readonly action?: string;

  @ApiPropertyOptional({ description: 'Filter by execution status (SUCCESS or FAILURE)' })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({ description: 'Filter by user role (e.g. admin, doctor, patient, nurse, staff)' })
  @IsOptional()
  @IsString()
  readonly userRole?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  readonly userId?: string;

  @ApiPropertyOptional({ description: 'Filter by user email' })
  @IsOptional()
  @IsString()
  readonly userEmail?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type (e.g. Appointment, Patient, Doctor, LabTest, Medication, User)' })
  @IsOptional()
  @IsString()
  readonly entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by HTTP method (GET, POST, PATCH, PUT, DELETE)' })
  @IsOptional()
  @IsString()
  readonly method?: string;

  @ApiPropertyOptional({ description: 'Filter by HTTP status code (200, 201, 400, 500)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly statusCode?: number;


  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsOptional()
  @IsString()
  readonly ipAddress?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Number of records per page (alias for take)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit?: number;
}
