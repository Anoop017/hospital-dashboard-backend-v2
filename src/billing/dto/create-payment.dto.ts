import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  billId: string;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'credit_card' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false, example: 'TXN-987654321' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
