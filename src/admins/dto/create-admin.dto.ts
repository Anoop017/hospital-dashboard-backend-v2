import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '../../common/enums/admin-role.enum';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'admin@hospital.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, example: '+1234567890' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiProperty({
    example: AdminRole.ADMIN,
    enum: AdminRole,
    description: 'Role for this admin',
  })
  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
