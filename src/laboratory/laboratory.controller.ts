import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('laboratory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Order a new lab test' })
  create(@Body() createLabTestDto: CreateLabTestDto) {
    return this.laboratoryService.create(createLabTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab tests' })
  findAll() {
    return this.laboratoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab test by id' })
  findOne(@Param('id') id: string) {
    return this.laboratoryService.findOne(id);
  }

  @Roles(Role.LAB_TECHNICIAN, Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a lab test (e.g. upload results)' })
  update(@Param('id') id: string, @Body() updateLabTestDto: UpdateLabTestDto) {
    return this.laboratoryService.update(id, updateLabTestDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lab test' })
  remove(@Param('id') id: string) {
    return this.laboratoryService.remove(id);
  }
}
