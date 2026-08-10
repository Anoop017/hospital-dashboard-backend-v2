import { PartialType } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @ApiProperty({ required: false, example: 'paid' })
  @IsOptional()
  @IsString()
  status?: string;
}
