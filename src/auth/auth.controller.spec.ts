import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({ accessToken: 'test-token' }),
    register: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token', async () => {
      const mockDto = { email: 'test@test.com', password: '123' };
      mockAuthService.validateUser.mockResolvedValue({ id: '1', email: 'test@test.com' });

      const result = await controller.login(mockDto);
      expect(result).toEqual({ accessToken: 'test-token' });
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto: RegisterDto = { email: 'p@test.com', password: '123', firstName: 'P', lastName: 'T', mobile: '1234567890' };
      mockAuthService.register.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });
  });
});
