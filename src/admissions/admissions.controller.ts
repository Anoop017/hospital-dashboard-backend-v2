import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { QueryAdmissionDto } from './dto/query-admission.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create a new admission' })
  create(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.admissionsService.create(createAdmissionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.STAFF)
  @ApiOperation({ summary: 'Get all admissions with pagination, search, and filters' })
  findAll(@Query() queryDto: QueryAdmissionDto) {
    return this.admissionsService.findAll(queryDto);
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get my admissions' })
  findMe(@Request() req: any, @Query() queryDto: QueryAdmissionDto) {
    const userId = Number(req.user.userId || req.user.sub);
    return this.admissionsService.findMy(userId, queryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.STAFF, Role.PATIENT)
  @ApiOperation({ summary: 'Get an admission by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.admissionsService.findOne(id, userId, roles);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update an admission (e.g. discharge, transfer bed)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAdmissionDto: UpdateAdmissionDto) {
    return this.admissionsService.update(id, updateAdmissionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an admission' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.admissionsService.remove(id);
  }
}
