import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLabTestDto } from './create-lab-test.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateLabTestDto extends PartialType(CreateLabTestDto) {
  @ApiPropertyOptional({ example: 'completed' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'WBC is high.' })
  @IsString()
  @IsOptional()
  resultDetails?: string;
}
