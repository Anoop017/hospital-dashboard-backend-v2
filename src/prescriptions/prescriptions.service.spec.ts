import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsService } from './prescriptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { MockRepository } from '../common/test-utils/mock-repository';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        { provide: getRepositoryToken(Prescription), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    mockRepo = module.get(getRepositoryToken(Prescription));
  });

  it('should create prescription', async () => {
    mockRepo.save.mockResolvedValue({ id: '1' });
    const result = await service.create({ patientId: 'p1', doctorId: 'd1', items: [{ medicineId: 'm1', dosage: '1', frequency: 'daily', duration: '7 days' }] });
    expect(result).toEqual({ id: '1' });
  });
});
