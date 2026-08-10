import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
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

  @Get('bills')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.STAFF)
  @ApiOperation({ summary: 'Get all bills' })
  findAllBills() {
    return this.billingService.findAllBills();
  }

  @Get('bills/:id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Get a bill by ID' })
  findOneBill(@Param('id') id: string) {
    return this.billingService.findOneBill(id);
  }

  @Patch('bills/:id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update a bill' })
  updateBill(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billingService.updateBill(id, updateBillDto);
  }

  @Post('payments')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.PATIENT)
  @ApiOperation({ summary: 'Make a payment against a bill' })
  makePayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.billingService.makePayment(createPaymentDto);
  }
}
