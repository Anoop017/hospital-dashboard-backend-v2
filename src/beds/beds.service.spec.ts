import { Test, TestingModule } from '@nestjs/testing';
import { BedsService } from './beds.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bed } from './entities/bed.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException } from '@nestjs/common';

describe('BedsService', () => {
  let service: BedsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BedsService,
        { provide: getRepositoryToken(Bed), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<BedsService>(BedsService);
    mockRepo = module.get(getRepositoryToken(Bed));
  });

  it('should throw ConflictException if bed number exists in ward', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1 });
    await expect(service.create({ wardId: 1, bedNumber: 'B1' })).rejects.toThrow(ConflictException);
  });
});
