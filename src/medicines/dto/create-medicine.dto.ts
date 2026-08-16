import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PharmaCorp' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ example: 'Antibiotics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 5.50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}
