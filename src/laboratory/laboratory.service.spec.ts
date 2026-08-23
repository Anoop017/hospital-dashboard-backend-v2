import { Test, TestingModule } from '@nestjs/testing';
import { LaboratoryService } from './laboratory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LabTest } from './entities/lab-test.entity';
import { MockRepository } from '../common/test-utils/mock-repository';

describe('LaboratoryService', () => {
  let service: LaboratoryService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaboratoryService,
        { provide: getRepositoryToken(LabTest), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<LaboratoryService>(LaboratoryService);
    mockRepo = module.get(getRepositoryToken(LabTest));
  });

  it('should create lab test', async () => {
    mockRepo.save.mockResolvedValue({ id: '1' });
    const result = await service.create({
      patientId: 'p1',
      doctorId: 'd1',
      testName: 'Blood Test',
      testType: 'Hematology',
    });
    expect(result).toEqual({ id: '1' });
  });
});
