import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Request, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientWithUserDto } from './dto/create-patient-with-user.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Create a new patient profile' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Post('with-user')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create a new patient profile along with a new user account' })
  createWithUser(@Body() createPatientWithUserDto: CreatePatientWithUserDto) {
    return this.patientsService.createWithUser(createPatientWithUserDto);
  }

  @Get('overview')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get formatted patient overview list' })
  getOverview(@Query('filter') filter?: string) {
    return this.patientsService.getOverview(filter);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all patients' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get current patient profile' })
  findMe(@Request() req: any) {
    return this.patientsService.findOneByUserId(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Get a patient by ID' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Update a patient profile' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete('bulk')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk soft delete patients' })
  bulkRemove(@Body('ids') ids: string[]) {
    return this.patientsService.bulkRemove(ids);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a patient profile' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
