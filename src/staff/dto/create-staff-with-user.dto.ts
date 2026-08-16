import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateStaffDto } from './create-staff.dto';
import { OmitType } from '@nestjs/swagger';

class StaffDataDto extends OmitType(CreateStaffDto, ['userId'] as const) {}

export class CreateStaffWithUserDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ApiProperty({ type: StaffDataDto })
  @ValidateNested()
  @Type(() => StaffDataDto)
  staff: StaffDataDto;
}
