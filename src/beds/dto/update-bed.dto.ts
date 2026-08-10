import { PartialType } from '@nestjs/swagger';
import { CreateBedDto } from './create-bed.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBedDto extends PartialType(CreateBedDto) {
  @ApiProperty({ required: false, example: 'occupied' })
  @IsOptional()
  @IsString()
  status?: string;
}
