import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('medicines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Roles(Role.ADMIN, Role.PHARMACIST)
  @Post()
  @ApiOperation({ summary: 'Add a new medicine' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Get medicine inventory statistics (low stock, out of stock)' })
  getStats() {
    return this.medicinesService.getInventoryStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with pagination, search, and low-stock filter' })
  findAll(@Query() queryDto: QueryMedicineDto) {
    return this.medicinesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.PHARMACIST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a medicine' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medicine (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.remove(id);
  }
}
