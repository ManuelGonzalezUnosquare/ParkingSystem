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

  it('should assign all candidates if slots are enough (Scenario A)', () => {
    const candidates = [
      { id: 1, priorityScore: 0 },
      { id: 2, priorityScore: 10 },
    ] as any;
    const slots = [
      { id: 101, slotNumber: '1' },
      { id: 102, slotNumber: '2' },
    ] as any;

    const result = service['runSelection'](candidates, slots);

    expect(result.winners).toHaveLength(2);
    expect(result.losers).toHaveLength(0);
  });

  it('should give more chances to higher priorityScore (Probability Check)', () => {
    const loser = { id: 1, priorityScore: 0, vehicles: [{ id: 1 }] } as any;
    const favorite = { id: 2, priorityScore: 99, vehicles: [{ id: 2 }] } as any;
    const slots = [{ id: 101, slotNumber: '1' }] as any;

    let favoriteWins = 0;
    for (let i = 0; i < 100; i++) {
      const res = service['runSelection']([loser, favorite], slots);
      if (res.winners[0].user.id === 2) favoriteWins++;
    }

    expect(favoriteWins).toBeGreaterThan(90);
  });
});
