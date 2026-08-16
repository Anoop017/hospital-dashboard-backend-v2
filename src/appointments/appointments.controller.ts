import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get all appointments' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get appointments for the logged-in user' })
  findMe(@Request() req: any) {
    return this.appointmentsService.findMy(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Get an appointment by ID' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  @ApiOperation({ summary: 'Update an appointment' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Cancel an appointment (soft delete)' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
