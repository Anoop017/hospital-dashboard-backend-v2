import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6g7h8', description: 'Password reset token or code received via email' })
  @IsString()
  @IsNotEmpty({ message: 'Reset token cannot be empty' })
  token: string;

  @ApiProperty({ example: 'newSecurePassword123!', description: 'New password for the account' })
  @IsString()
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
