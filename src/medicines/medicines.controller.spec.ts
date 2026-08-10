import { Test, TestingModule } from '@nestjs/testing';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';

describe('MedicinesController', () => {
  let controller: MedicinesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicinesController],
      providers: [{ provide: MedicinesService, useValue: mockService }],
    }).compile();

    controller = module.get<MedicinesController>(MedicinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
