import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreatePatientDto } from './create-patient.dto';
import { OmitType } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

class PatientDataDto extends OmitType(CreatePatientDto, ['userId'] as const) {
  @IsOptional()
  userId?: string;
}

export class CreatePatientWithUserDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ApiProperty({ type: PatientDataDto })
  @ValidateNested()
  @Type(() => PatientDataDto)
  patient: PatientDataDto;
}
