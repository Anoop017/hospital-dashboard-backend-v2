import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsService } from './doctors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: getRepositoryToken(Doctor), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
    mockRepo = module.get(getRepositoryToken(Doctor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if profile exists for user', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: '1' }); // user exists
      await expect(service.create({ userId: 'user1', specialization: 'Cardiology', licenseNumber: 'L1' })).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if license exists', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null); // user doesn't exist
      mockRepo.findOne.mockResolvedValueOnce({ id: '1' }); // license exists
      await expect(service.create({ userId: 'user1', specialization: 'Cardiology', licenseNumber: 'L1' })).rejects.toThrow(ConflictException);
    });

    it('should create doctor', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.save.mockResolvedValueOnce({ id: '1' });

      const result = await service.create({ userId: 'user1', specialization: 'Cardiology', licenseNumber: 'L1' });
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findOne', () => {
    it('should return doctor if found', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: '1' });
      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
