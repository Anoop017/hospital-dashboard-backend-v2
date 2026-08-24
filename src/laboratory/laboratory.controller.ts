import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { QueryLabTestDto } from './dto/query-lab-test.dto';
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

  @Get('stats')
  @Roles(Role.ADMIN, Role.LAB_TECHNICIAN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get lab tests overview statistics' })
  getStats() {
    return this.laboratoryService.getLabStats();
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Get all lab tests with pagination and filters' })
  findAll(@Query() queryDto: QueryLabTestDto) {
    return this.laboratoryService.findAll(queryDto);
  }

  @Get('me')
  @Roles(Role.PATIENT, Role.DOCTOR)
  @ApiOperation({ summary: 'Get my lab tests' })
  findMe(@Request() req: any, @Query() queryDto: QueryLabTestDto) {
    const userId = Number(req.user.userId || req.user.sub);
    return this.laboratoryService.findMy(userId, queryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.LAB_TECHNICIAN, Role.NURSE, Role.PATIENT)
  @ApiOperation({ summary: 'Get lab test by id' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.laboratoryService.findOne(id, userId, roles);
  }

  @Roles(Role.LAB_TECHNICIAN, Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a lab test (upload results, modify status)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLabTestDto: UpdateLabTestDto) {
    return this.laboratoryService.update(id, updateLabTestDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lab test' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoryService.remove(id);
  }
}
