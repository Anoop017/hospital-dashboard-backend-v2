import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('pharmacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Roles(Role.ADMIN, Role.PHARMACIST)
  @Post('fulfill/:prescriptionId')
  @ApiOperation({ summary: 'Fulfill a prescription and deduct stock' })
  fulfillPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.pharmacyService.fulfillPrescription(prescriptionId);
  }
}
