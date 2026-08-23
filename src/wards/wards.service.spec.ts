import { Test, TestingModule } from '@nestjs/testing';
import { WardsService } from './wards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ward } from './entities/ward.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException } from '@nestjs/common';

describe('WardsService', () => {
  let service: WardsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WardsService,
        { provide: getRepositoryToken(Ward), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<WardsService>(WardsService);
    mockRepo = module.get(getRepositoryToken(Ward));
  });

  it('should throw ConflictException if ward name exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: '1' });
    await expect(
      service.create({ name: 'Ward A', type: 'General', capacity: 10, floor: '1st Floor' }),
    ).rejects.toThrow(ConflictException);
  });
});
