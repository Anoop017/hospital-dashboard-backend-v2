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
    mockRepo.save.mockResolvedValue({ id: 1 });
    const result = await service.create({
      patientId: 1,
      doctorId: 1,
      medication: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '7 days',
    });
    expect(result).toEqual({ id: 1 });
  });
});
