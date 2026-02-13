import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService } from './raffle.service';
import { Raffle, RaffleResult } from '@database/entities';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '@modules/users/services';

export const mockDataSource = {
  getRepository: jest.fn().mockReturnValue({
    createQueryRunner: jest.fn().mockResolvedValue({}),
  }),
} as unknown as DataSource;

describe('RaffleService', () => {
  let service: RaffleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaffleService,
        {
          provide: getRepositoryToken(Raffle),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RaffleResult),
          useValue: {},
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            internalUpdate: jest.fn(),
            findByResetCode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
