import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWardDto {
  @ApiProperty({ example: 'ICU 1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'icu' })
  @IsString()
  type: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: '3rd Floor' })
  @IsString()
  floor: string;
}
