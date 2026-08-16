import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateDoctorDto } from './create-doctor.dto';
import { OmitType } from '@nestjs/swagger';

class DoctorDataDto extends OmitType(CreateDoctorDto, ['userId'] as const) {}

export class CreateDoctorWithUserDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ApiProperty({ type: DoctorDataDto })
  @ValidateNested()
  @Type(() => DoctorDataDto)
  doctor: DoctorDataDto;
}
