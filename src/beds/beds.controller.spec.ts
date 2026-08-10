import { Test, TestingModule } from '@nestjs/testing';
import { BedsController } from './beds.controller';
import { BedsService } from './beds.service';

describe('BedsController', () => {
  let controller: BedsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BedsController],
      providers: [{ provide: BedsService, useValue: mockService }],
    }).compile();

    controller = module.get<BedsController>(BedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
