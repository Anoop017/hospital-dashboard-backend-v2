import { Test, TestingModule } from '@nestjs/testing';
import { MedicinesService } from './medicines.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException } from '@nestjs/common';

describe('MedicinesService', () => {
  let service: MedicinesService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicinesService,
        { provide: getRepositoryToken(Medicine), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<MedicinesService>(MedicinesService);
    mockRepo = module.get(getRepositoryToken(Medicine));
  });

  it('should throw ConflictException if medicine name exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: '1' });
    await expect(service.create({ name: 'Paracetamol', manufacturer: 'A', unitPrice: 1, stockQuantity: 10 })).rejects.toThrow(ConflictException);
  });
});
