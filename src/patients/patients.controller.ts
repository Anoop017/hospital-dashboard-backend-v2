import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientWithUserDto } from './dto/create-patient-with-user.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

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

  @Get('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get current patient profile' })
  findMe(@Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    return this.patientsService.findOneByUserId(userId);
  }

  @Get(':id/summary')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get 360-degree patient timeline & clinical summary' })
  getSummary(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientSummary(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all patients with pagination, search, and filters' })
  findAll(@Query() queryDto: QueryPatientDto) {
    return this.patientsService.findAll(queryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Get a patient by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.patientsService.findOne(id, userId, roles);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  @ApiOperation({ summary: 'Update a patient profile' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete('bulk')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk soft delete patients' })
  bulkRemove(@Body('ids') ids: number[]) {
    return this.patientsService.bulkRemove(ids);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a patient profile' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.remove(id);
  }
}
