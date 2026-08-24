import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('StaffService', () => {
  let service: StaffService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: getRepositoryToken(Staff), useClass: MockRepository },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    mockRepo = module.get(getRepositoryToken(Staff));
  });

  it('should throw ConflictException if staff profile exists for user', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1 });
    await expect(service.create({ userId: 1, departmentId: 1, jobTitle: 'Nurse', hireDate: '2023-01-01' })).rejects.toThrow(ConflictException);
  });
});
