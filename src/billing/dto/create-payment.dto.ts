import { IsNumber, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  INSURANCE = 'insurance',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  ONLINE = 'online',
}

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Bill ID to pay against' })
  @Type(() => Number)
  @IsInt()
  billId: number;

  @ApiProperty({ example: 100.0, description: 'Payment amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'TXN-987654321', description: 'Transaction / reference number' })
  @IsOptional()
  referenceNumber?: string;
}
