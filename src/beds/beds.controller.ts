import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BedsService } from './beds.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('beds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('beds')
export class BedsController {
  constructor(private readonly bedsService: BedsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new bed' })
  create(@Body() createBedDto: CreateBedDto) {
    return this.bedsService.create(createBedDto);
  }

  @Get('availability-matrix')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get live bed availability matrix grouped by ward' })
  getAvailabilityMatrix() {
    return this.bedsService.getAvailabilityMatrix();
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get all beds, optionally filtered by ward or status' })
  @ApiQuery({ name: 'wardId', required: false })
  @ApiQuery({ name: 'status', required: false, example: 'available' })
  findAll(@Query('wardId') wardId?: string, @Query('status') status?: string) {
    return this.bedsService.findAll(wardId, status);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.STAFF)
  @ApiOperation({ summary: 'Get a bed by ID' })
  findOne(@Param('id') id: string) {
    return this.bedsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiOperation({ summary: 'Update a bed' })
  update(@Param('id') id: string, @Body() updateBedDto: UpdateBedDto) {
    return this.bedsService.update(id, updateBedDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a bed' })
  remove(@Param('id') id: string) {
    return this.bedsService.remove(id);
  }
}
