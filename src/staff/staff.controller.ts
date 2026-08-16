import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStaffWithUserDto } from './dto/create-staff-with-user.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new staff profile' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Post('with-user')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new staff profile along with a new user account' })
  createWithUser(@Body() createStaffWithUserDto: CreateStaffWithUserDto) {
    return this.staffService.createWithUser(createStaffWithUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get all staff members' })
  findAll() {
    return this.staffService.findAll();
  }

  @Get('me')
  @Roles(Role.STAFF, Role.NURSE, Role.RECEPTIONIST, Role.LAB_TECHNICIAN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Get current staff profile' })
  findMe(@Request() req: any) {
    return this.staffService.findOneByUserId(req.user.sub);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get a staff member by ID' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a staff member profile' })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a staff member profile' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
