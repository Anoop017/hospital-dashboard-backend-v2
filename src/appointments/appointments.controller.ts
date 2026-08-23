import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Create a new appointment' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get('available-slots')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Check doctor slot availability for a given date' })
  @ApiQuery({ name: 'doctorId', required: true })
  @ApiQuery({ name: 'date', required: true, example: '2026-08-30' })
  getAvailableSlots(@Query('doctorId') doctorId: string, @Query('date') date: string) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get all appointments with pagination, search, and filters' })
  findAll(@Query() queryDto: QueryAppointmentDto) {
    return this.appointmentsService.findAll(queryDto);
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointments for the logged-in user' })
  findMe(@Request() req: any, @Query() queryDto: QueryAppointmentDto) {
    const userId = req.user.userId || req.user.sub;
    return this.appointmentsService.findMy(userId, queryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Get an appointment by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    const roles = req.user.roles || [];
    return this.appointmentsService.findOne(id, userId, roles);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Update an appointment' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Update appointment status (cancel, check-in, complete)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Cancel an appointment (soft delete)' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
