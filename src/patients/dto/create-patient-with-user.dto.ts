import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreatePatientDto } from './create-patient.dto';
import { OmitType } from '@nestjs/swagger';

class PatientDataDto extends OmitType(CreatePatientDto, ['userId'] as const) {}

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
