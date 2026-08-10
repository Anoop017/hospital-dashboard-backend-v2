import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Gender } from '../common/enums/gender.enum';

describe('PatientsService', () => {
  let service: PatientsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getRepositoryToken(Patient), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    mockRepo = module.get(getRepositoryToken(Patient));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if profile exists for user', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: '1' });
      await expect(service.create({ userId: 'user1' })).rejects.toThrow(ConflictException);
    });

    it('should create patient', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.save.mockResolvedValueOnce({ id: '1', userId: 'user1' });

      const result = await service.create({ userId: 'user1' });
      expect(result).toEqual({ id: '1', userId: 'user1' });
    });
  });

  describe('findOne', () => {
    it('should return patient if found', async () => {
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
