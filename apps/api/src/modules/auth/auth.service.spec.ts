import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  createMockCryptoService,
  createMockUserService,
  MockUserService,
} from '@test/mocks/services';
import { CryptoService } from '@utils/services';

describe('AuthService', () => {
  let service: AuthService;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMockUserService(),
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: createMockCryptoService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<MockUserService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
