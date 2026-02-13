import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    publicId: 'uuid-123',
    role: 'admin',
    password: 'hashedPassword',
  };

  const mockSession = {
    access_token: 'mock_token',
    user: { email: 'test@example.com', role: 'admin' } as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            resetPasswordRequest: jest.fn(),
            resetPassword: jest.fn(),
            validateResetCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a session model on successful login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      authService.validateUser.mockResolvedValue(mockUser as any);
      authService.login.mockReturnValue(mockSession);

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('getMe', () => {
    it('should return the current user transformed to model', async () => {
      const result = await controller.getMe(mockUser as any);

      // Verificamos que se aplique la transformación de entidad a modelo
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('resetPasswordConfirm', () => {
    it('should confirm reset and return a new session', async () => {
      const dto = {
        email: 'test@example.com',
        code: '12345678',
        newPassword: 'new',
      };

      authService.resetPassword.mockResolvedValue(mockUser as any);
      authService.login.mockReturnValue(mockSession);

      const result = await controller.resetPasswordConfirm(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });
  });

  describe('validateCode', () => {
    it('should return the email associated with the code', async () => {
      const dto = { code: '12345678' };
      authService.validateResetCode.mockResolvedValue('test@example.com');

      const result = await controller.validateCode(dto);

      expect(result).toEqual('test@example.com');
      expect(authService.validateResetCode).toHaveBeenCalledWith(dto.code);
    });
  });
});
