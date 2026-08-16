import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BedsService } from './beds.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new bed in a ward' })
  create(@Body() createBedDto: CreateBedDto) {
    return this.bedsService.create(createBedDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.STAFF, Role.PATIENT)
  @ApiOperation({ summary: 'Get all beds' })
  findAll() {
    return this.bedsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.STAFF, Role.PATIENT)
  @ApiOperation({ summary: 'Get a bed by ID' })
  findOne(@Param('id') id: string) {
    return this.bedsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Update a bed (e.g., status, assign patient)' })
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
