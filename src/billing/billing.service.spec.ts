import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Payment } from './entities/payment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { PaymentMethod } from './dto/create-payment.dto';
import { MockRepository, MockQueryRunner } from '../common/test-utils/mock-repository';
import { DataSource } from 'typeorm';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: getRepositoryToken(Bill), useClass: MockRepository },
        { provide: getRepositoryToken(Payment), useClass: MockRepository },
        { provide: getRepositoryToken(Patient), useClass: MockRepository },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(MockQueryRunner) },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should make payment successfully in transaction', async () => {
    const bill = { id: 'b1', totalAmount: 100, paidAmount: 0, status: 'unpaid' };
    MockQueryRunner.manager.findOne.mockResolvedValue(bill);
    MockQueryRunner.manager.create.mockReturnValue({ id: 'p1', amount: 50 });

    const result = await service.makePayment({ billId: 'b1', amount: 50, paymentMethod: PaymentMethod.CASH });

    expect(MockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(MockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(MockQueryRunner.release).toHaveBeenCalled();
    expect(bill.status).toBe('partially_paid');
    expect(result).toHaveProperty('amount', 50);
  });
});
