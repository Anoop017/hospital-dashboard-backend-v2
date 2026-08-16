import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('medical-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Create a new medical record' })
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Get all medical records' })
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get my medical records' })
  findMe(@Request() req: any) {
    return this.medicalRecordsService.findMy(req.user.sub);
  }

  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  @ApiOperation({ summary: 'Get all medical records for a specific patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findByPatient(patientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  @ApiOperation({ summary: 'Get a medical record by ID' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update a medical record' })
  update(@Param('id') id: string, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a medical record' })
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id);
  }
}
