import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PHARMACIST)
  @ApiOperation({ summary: 'Get all prescriptions' })
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get my prescriptions' })
  findMe(@Request() req: any) {
    return this.prescriptionsService.findMy(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.PHARMACIST)
  @ApiOperation({ summary: 'Get prescription by id' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a prescription' })
  update(@Param('id') id: string, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prescription' })
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
