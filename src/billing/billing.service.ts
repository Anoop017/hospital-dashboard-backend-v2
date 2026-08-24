import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { Payment } from './entities/payment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryBillDto } from './dto/query-bill.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private dataSource: DataSource,
  ) {}

  async createBill(createBillDto: CreateBillDto): Promise<Bill> {
    const bill = this.billsRepository.create(createBillDto);
    return this.billsRepository.save(bill);
  }

  async findAllBills(queryDto?: QueryBillDto): Promise<PageDto<Bill>> {
    const qb = this.billsRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('bill.admission', 'admission')
      .leftJoinAndSelect('bill.appointment', 'appointment')
      .leftJoinAndSelect('bill.payments', 'payments');

    if (queryDto?.status) {
      qb.andWhere('bill.status = :status', { status: queryDto.status });
    }

    if (queryDto?.patientId) {
      qb.andWhere('bill.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.admissionId) {
      qb.andWhere('bill.admissionId = :admissionId', { admissionId: queryDto.admissionId });
    }

    if (queryDto?.appointmentId) {
      qb.andWhere('bill.appointmentId = :appointmentId', { appointmentId: queryDto.appointmentId });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    if (queryDto?.startDate && queryDto?.endDate) {
      qb.andWhere('bill.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(queryDto.startDate),
        endDate: new Date(queryDto.endDate),
      });
    } else if (queryDto?.startDate) {
      qb.andWhere('bill.createdAt >= :startDate', { startDate: new Date(queryDto.startDate) });
    } else if (queryDto?.endDate) {
      qb.andWhere('bill.createdAt <= :endDate', { endDate: new Date(queryDto.endDate) });
    }

    const sortField = queryDto?.sortBy === 'totalAmount' ? 'bill.totalAmount' : 'bill.createdAt';
    const sortOrder = queryDto?.sortOrder || 'DESC';
    qb.orderBy(sortField, sortOrder);

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [bills, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(bills, pageMetaDto);
  }

  async findMyBills(userId: number, queryDto?: QueryBillDto): Promise<PageDto<Bill>> {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) {
      throw new NotFoundException('Patient profile not found for the current user');
    }

    const mergedQuery: QueryBillDto = Object.assign(new QueryBillDto(), queryDto, {
      patientId: patient.id,
    });

    return this.findAllBills(mergedQuery);
  }

  async findOneBill(id: number, userId?: number, roles: string[] = []): Promise<Bill> {
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

    // Role-based data ownership verification
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('receptionist')) {
      const patient = await this.patientRepository.findOne({ where: { userId } });
      if (!patient || patient.id !== bill.patientId) {
        throw new ForbiddenException('You are not authorized to view this bill');
      }
    }

    return bill;
  }

  async updateBill(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
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
      const savedPayment = await queryRunner.manager.save(payment);

      // Update bill paid amount and status
      bill.paidAmount = Number(bill.paidAmount) + Number(payment.amount);
      if (bill.paidAmount >= bill.totalAmount) {
        bill.status = 'paid';
      } else if (bill.paidAmount > 0) {
        bill.status = 'partially_paid';
      }

      await queryRunner.manager.save(bill);
      await queryRunner.commitTransaction();

      return savedPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getBillingStats() {
    const totalBills = await this.billsRepository.count();
    const paidBills = await this.billsRepository.count({ where: { status: 'paid' } });
    const partiallyPaidBills = await this.billsRepository.count({ where: { status: 'partially_paid' } });
    const unpaidBills = await this.billsRepository.count({ where: { status: 'unpaid' } });

    const totalRevenueRaw = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueRaw?.total || '0');

    const totalBilledRaw = await this.billsRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.totalAmount)', 'total')
      .getRawOne();
    const totalBilled = parseFloat(totalBilledRaw?.total || '0');

    const outstandingReceivables = Math.max(0, totalBilled - totalRevenue);

    // Payment methods breakdown
    const paymentMethodsRaw = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .groupBy('payment.paymentMethod')
      .getRawMany();

    return {
      summary: {
        totalBills,
        paidBills,
        partiallyPaidBills,
        unpaidBills,
        totalBilled,
        totalRevenue,
        outstandingReceivables,
        collectionRate: totalBilled > 0 ? Number(((totalRevenue / totalBilled) * 100).toFixed(2)) : 0,
      },
      paymentMethods: paymentMethodsRaw.map((pm) => ({
        method: pm.method,
        count: parseInt(pm.count, 10),
        amount: parseFloat(pm.amount || '0'),
      })),
    };
  }

  async getReceipt(id: number, userId?: number, roles: string[] = []) {
    const bill = await this.findOneBill(id, userId, roles);

    return {
      invoiceNumber: `INV-${String(bill.id).padStart(6, '0')}`,
      billId: bill.id,
      issueDate: bill.createdAt,
      dueDate: bill.dueDate,
      status: bill.status,
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount,
      balanceDue: Math.max(0, Number(bill.totalAmount) - Number(bill.paidAmount)),
      patient: {
        id: bill.patient?.id,
        name: bill.patient?.user ? `${bill.patient.user.firstName} ${bill.patient.user.lastName}` : 'N/A',
        email: bill.patient?.user?.email,
        phone: bill.patient?.user?.mobile,
        address: bill.patient?.address,
      },
      admission: bill.admission ? { id: bill.admission.id, admissionDate: bill.admission.admissionDate } : null,
      appointment: bill.appointment ? { id: bill.appointment.id, date: bill.appointment.appointmentDate } : null,
      payments: (bill.payments || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
      })),
    };
  }
}
