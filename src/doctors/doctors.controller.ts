import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateDoctorWithUserDto } from './dto/create-doctor-with-user.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new doctor profile' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Post('with-user')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new doctor profile along with a new user account' })
  createWithUser(@Body() createDoctorWithUserDto: CreateDoctorWithUserDto) {
    return this.doctorsService.createWithUser(createDoctorWithUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT, Role.NURSE)
  @ApiOperation({ summary: 'Get all doctors' })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get current doctor profile' })
  findMe(@Request() req: any) {
    return this.doctorsService.findOneByUserId(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT, Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Get a doctor by ID' })
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Update a doctor profile' })
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a doctor profile' })
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
