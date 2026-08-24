import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Request, ParseIntPipe } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryBillDto } from './dto/query-bill.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('bills')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create a new bill' })
  createBill(@Body() createBillDto: CreateBillDto) {
    return this.billingService.createBill(createBillDto);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get billing KPI analytics & revenue overview' })
  getBillingStats() {
    return this.billingService.getBillingStats();
  }

  @Get('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get bills for the current logged-in patient' })
  findMyBills(@Request() req: any, @Query() queryDto: QueryBillDto) {
    const userId = Number(req.user.userId || req.user.sub);
    return this.billingService.findMyBills(userId, queryDto);
  }

  @Get('bills')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.STAFF)
  @ApiOperation({ summary: 'Get all bills with pagination, search, and filters' })
  findAllBills(@Query() queryDto: QueryBillDto) {
    return this.billingService.findAllBills(queryDto);
  }

  @Get('bills/:id/receipt')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Get printable invoice/receipt details for a bill' })
  getReceipt(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.billingService.getReceipt(id, userId, roles);
  }

  @Get('bills/:id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Get a bill by ID' })
  findOneBill(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user.userId || req.user.sub);
    const roles = req.user.roles || [];
    return this.billingService.findOneBill(id, userId, roles);
  }

  @Patch('bills/:id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update a bill' })
  updateBill(@Param('id', ParseIntPipe) id: number, @Body() updateBillDto: UpdateBillDto) {
    return this.billingService.updateBill(id, updateBillDto);
  }

  @Post('payments')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Make a payment against a bill' })
  makePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.billingService.makePayment(createPaymentDto);
  }
}
