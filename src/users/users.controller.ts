import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('users (admin only)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with specific roles' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdminUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users, optionally filtered by role' })
  findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get a summarized list of all users' })
  findAllSummary() {
    return this.usersService.findAllSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user (roles, status, details)' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a user account' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
