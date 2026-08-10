import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Heart and blood vessel diseases' })
  @IsOptional()
  @IsString()
  description?: string;
}
