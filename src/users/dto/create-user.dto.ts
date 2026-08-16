import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'doctor@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: true, example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ 
    example: ['doctor'], 
    enum: Role, 
    isArray: true,
    description: 'Array of roles to assign to the new user'
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];
}
