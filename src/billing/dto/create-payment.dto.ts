import { IsNumber, IsUUID, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bill ID to pay against' })
  @IsUUID()
  billId: string;

  @ApiProperty({ example: 100.00, description: 'Payment amount' })
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
