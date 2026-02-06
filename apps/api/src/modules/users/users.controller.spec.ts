import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@database/entities';
import { createMockRepository } from '@test/mocks/repositories/repository.mock';
import {
  MockCryptoService,
  createMockCryptoService,
} from '@test/mocks/services';
import { CryptoService } from '@utils/services';

describe('UsersController', () => {
  let controller: UsersController;

  let cryptoService: MockCryptoService;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: CryptoService,
          useValue: createMockCryptoService(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    cryptoService = module.get<MockCryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
