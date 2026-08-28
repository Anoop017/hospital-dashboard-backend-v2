import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'redis.host') return 'localhost';
              if (key === 'redis.port') return 6379;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fail-open gracefully when redis is offline', async () => {
    // When offline, get returns null without throwing
    const val = await service.get('test_key');
    expect(val).toBeNull();

    // When offline, set returns false without throwing
    const setResult = await service.set('test_key', { a: 1 });
    expect(setResult).toBe(false);

    // When offline, del returns false without throwing
    const delResult = await service.del('test_key');
    expect(delResult).toBe(false);
  });
});
