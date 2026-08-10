import { Test, TestingModule } from '@nestjs/testing';
import { WardsController } from './wards.controller';
import { WardsService } from './wards.service';

describe('WardsController', () => {
  let controller: WardsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsController],
      providers: [{ provide: WardsService, useValue: mockService }],
    }).compile();

    controller = module.get<WardsController>(WardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
