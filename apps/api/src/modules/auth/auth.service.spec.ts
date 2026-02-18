import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/services/users.service';
import { CryptoService } from '@utils/services';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from '@database/entities';

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;
  let cryptoService: any;
  let jwtService: any;

  const mockUser = {
    id: 1,

    email: 'test@example.com',
    password: 'hashedPassword',
    publicId: 'uuid-123',
    role: {
      name: 'admin',
    },
    passwordResetCode: '12345678',
  } as Partial<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            internalUpdate: jest.fn(),
            findByResetCode: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked_token'),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            compare: jest.fn(),
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    cryptoService = module.get<CryptoService>(CryptoService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      userService.findOneByEmail.mockResolvedValue(mockUser);
      cryptoService.compare.mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(cryptoService.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('wrong@email.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      userService.findOneByEmail.mockResolvedValue(mockUser);
      cryptoService.compare.mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong_pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a session model with access_token', () => {
      const userModel: any = {
        email: mockUser.email,
        publicId: mockUser.publicId,
        role: mockUser.role,
      };

      const result = service.login(userModel);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mocked_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('resetPasswordRequest', () => {
    it('should generate a code and update user if email exists', async () => {
      userService.findOneByEmail.mockResolvedValue(mockUser);
      userService.internalUpdate.mockResolvedValue({ ...mockUser });

      const result = await service.resetPasswordRequest('test@example.com');

      expect(result).toHaveLength(8);
      expect(userService.internalUpdate).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          passwordResetCode: expect.any(String),
        }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.resetPasswordRequest('unknown@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should update password and return updated user on valid code', async () => {
      const dto = {
        email: mockUser.email,
        code: '12345678',
        newPassword: 'newPassword123',
      };
      userService.findOneByEmail.mockResolvedValue(mockUser);
      cryptoService.hash.mockResolvedValue('newHashedPassword');
      userService.internalUpdate.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      const result = await service.resetPassword(dto);

      expect(userService.internalUpdate).toHaveBeenCalled();
      expect(cryptoService.hash).toHaveBeenCalledWith(dto.newPassword);
    });

    it('should throw UnauthorizedException on invalid code', async () => {
      const dto = {
        email: mockUser.email,
        code: 'WRONG_CODE',
        newPassword: 'pass',
      };
      userService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
