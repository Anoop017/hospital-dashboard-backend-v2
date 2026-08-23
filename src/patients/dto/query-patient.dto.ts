import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/pagination/base-query.dto';
import { Gender } from '../../common/enums/gender.enum';
import { BloodGroup } from '../../common/enums/blood-group.enum';

export class QueryPatientDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: Gender, description: 'Filter by gender' })
  @IsEnum(Gender)
  @IsOptional()
  readonly gender?: Gender;

  @ApiPropertyOptional({ enum: BloodGroup, description: 'Filter by blood group' })
  @IsEnum(BloodGroup)
  @IsOptional()
  readonly bloodGroup?: BloodGroup;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. active, inactive)' })
  @IsString()
  @IsOptional()
  readonly status?: string;
}
