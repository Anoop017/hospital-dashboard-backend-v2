import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from './medical-records.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { MockRepository } from '../common/test-utils/mock-repository';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        { provide: getRepositoryToken(MedicalRecord), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
    mockRepo = module.get(getRepositoryToken(MedicalRecord));
  });

  it('should return records for patient', async () => {
    mockRepo.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.findByPatient(1);
    expect(result).toEqual([{ id: 1 }]);
  });
});
