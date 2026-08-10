import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getRepositoryToken(Department), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    mockRepo = module.get(getRepositoryToken(Department));
  });

  it('should throw ConflictException if department exists', async () => {
    mockRepo.findOne.mockResolvedValue({ id: '1' });
    await expect(service.create({ name: 'Cardio' })).rejects.toThrow(ConflictException);
  });
});
