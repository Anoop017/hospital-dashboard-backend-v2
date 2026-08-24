import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyService } from './pharmacy.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { MockRepository, MockQueryRunner } from '../common/test-utils/mock-repository';
import { DataSource } from 'typeorm';

describe('PharmacyService', () => {
  let service: PharmacyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: getRepositoryToken(Medicine), useClass: MockRepository },
        { provide: getRepositoryToken(Prescription), useClass: MockRepository },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(MockQueryRunner) },
        },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
  });

  it('should fulfill prescription successfully', async () => {
    const mockPrescription = {
      id: 1,
      medication: 'Paracetamol',
    };
    const mockMedicine = {
      id: 1,
      name: 'Paracetamol',
      stockQuantity: 10,
    };

    MockQueryRunner.manager.findOne
      .mockResolvedValueOnce(mockPrescription)
      .mockResolvedValueOnce(mockMedicine);
    MockQueryRunner.manager.save.mockImplementation((entity, data) => Promise.resolve(data));

    const result = await service.fulfillPrescription(1);
    expect(MockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(MockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 1);
  });
});
