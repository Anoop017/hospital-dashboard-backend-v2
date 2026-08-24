import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: MockRepository },
        { provide: getRepositoryToken(Role), useClass: MockRepository },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('1') } },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockUsersRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if email is missing', async () => {
      await expect(service.create({ mobile: '123' })).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if mobile is missing', async () => {
      await expect(service.create({ email: 'test@test.com' })).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email exists', async () => {
      mockUsersRepo.findOne.mockResolvedValueOnce({ id: 1 }); // email exists

      await expect(service.create({ email: 'test@test.com', mobile: '1234567890' })).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if mobile exists', async () => {
      mockUsersRepo.findOne.mockResolvedValueOnce(null); // email doesn't exist
      mockUsersRepo.findOne.mockResolvedValueOnce({ id: 2 }); // mobile exists

      await expect(service.create({ email: 'test@test.com', mobile: '1234567890' })).rejects.toThrow(ConflictException);
    });

    it('should create user', async () => {
      mockUsersRepo.findOne.mockResolvedValueOnce(null); // email doesn't exist
      mockUsersRepo.findOne.mockResolvedValueOnce(null); // mobile doesn't exist
      mockUsersRepo.save.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const result = await service.create({ email: 'test@test.com', mobile: '1234567890' });

      expect(mockUsersRepo.create).toHaveBeenCalled();
      expect(mockUsersRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      mockUsersRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
