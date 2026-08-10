import { Test, TestingModule } from '@nestjs/testing';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';

describe('LaboratoryController', () => {
  let controller: LaboratoryController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaboratoryController],
      providers: [{ provide: LaboratoryService, useValue: mockService }],
    }).compile();

    controller = module.get<LaboratoryController>(LaboratoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
