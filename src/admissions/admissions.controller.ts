import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
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
  @ApiOperation({ summary: 'Get all admissions' })
  findAll() {
    return this.admissionsService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get my admissions' })
  findMe(@Request() req: any) {
    return this.admissionsService.findMy(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.STAFF, Role.PATIENT)
  @ApiOperation({ summary: 'Get an admission by ID' })
  findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update an admission (e.g., discharge)' })
  update(@Param('id') id: string, @Body() updateAdmissionDto: UpdateAdmissionDto) {
    return this.admissionsService.update(id, updateAdmissionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an admission' })
  remove(@Param('id') id: string) {
    return this.admissionsService.remove(id);
  }
}
