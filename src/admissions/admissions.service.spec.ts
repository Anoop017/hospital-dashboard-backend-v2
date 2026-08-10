import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionsService } from './admissions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admission } from './entities/admission.entity';
import { MockRepository } from '../common/test-utils/mock-repository';

describe('AdmissionsService', () => {
  let service: AdmissionsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: getRepositoryToken(Admission), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<AdmissionsService>(AdmissionsService);
    mockRepo = module.get(getRepositoryToken(Admission));
  });

  it('should create an admission', async () => {
    mockRepo.save.mockResolvedValue({ id: '1' });
    const result = await service.create({ patientId: 'p1', admittingDoctorId: 'd1', bedId: 'b1', admissionDate: new Date().toISOString() });
    expect(result).toEqual({ id: '1' });
  });
});
