import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get tailored summary metrics based on the logged-in user role' })
  getSummary(@Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.dashboardService.getSummary(userId, roles);
  }

  @Get('analytics')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get time-series analytics data for charts (Admin only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  getAnalytics(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.dashboardService.getAdminAnalytics(period);
  }
}
