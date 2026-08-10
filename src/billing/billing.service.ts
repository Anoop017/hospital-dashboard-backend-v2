import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { Payment } from './entities/payment.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async createBill(createBillDto: CreateBillDto): Promise<Bill> {
    const bill = this.billsRepository.create(createBillDto);
    return this.billsRepository.save(bill);
  }

  async findAllBills(): Promise<Bill[]> {
    return this.billsRepository.find({
      relations: {
        patient: { user: true },
        admission: true,
        appointment: true,
        payments: true,
      },
    });
  }

  async findOneBill(id: string): Promise<Bill> {
    const bill = await this.billsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        admission: true,
        appointment: true,
        payments: true,
      },
    });
    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
    return bill;
  }

  async updateBill(id: string, updateBillDto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOneBill(id);
    this.billsRepository.merge(bill, updateBillDto);
    return this.billsRepository.save(bill);
  }

  async makePayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bill = await queryRunner.manager.findOne(Bill, {
        where: { id: createPaymentDto.billId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${createPaymentDto.billId} not found`);
      }

      const payment = queryRunner.manager.create(Payment, createPaymentDto);
      await queryRunner.manager.save(payment);

      // Update bill paid amount and status
      bill.paidAmount = Number(bill.paidAmount) + Number(payment.amount);
      if (bill.paidAmount >= bill.totalAmount) {
        bill.status = 'paid';
      } else if (bill.paidAmount > 0) {
        bill.status = 'partially_paid';
      }

      await queryRunner.manager.save(bill);
      await queryRunner.commitTransaction();

      return payment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
