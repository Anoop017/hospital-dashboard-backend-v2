import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import type { Response } from 'express';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get activity & audit logs with advanced filtering, search, and pagination',
    description: 'Filter logs by isAdmin (true for admin logs, false for doctors/patients/staff), module, action, status, role, date range, or full-text search keyword.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit logs retrieved successfully' })
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export filtered audit logs to a styled Excel (.xlsx) file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns Excel binary stream for download',
  })
  async exportToExcel(
    @Query() query: QueryAuditLogDto,
    @Res() res: Response,
  ) {
    return this.auditLogsService.exportToExcel(query, res);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get audit logs statistics and analytics breakdown',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics returned successfully' })
  async getStats(@Query() query: QueryAuditLogDto) {
    return this.auditLogsService.getStats(query);
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Get dynamic list of filter options (modules, actions, entityTypes, roles, methods, statuses)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Filter dropdown options returned successfully' })
  async getFilterOptions() {
    return this.auditLogsService.getFilterOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single audit log entry by ID or event ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit log details returned' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Audit log not found' })
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findById(id);
  }
}
