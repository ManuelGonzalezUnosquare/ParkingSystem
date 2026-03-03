import { RaffleResult } from '@database/entities';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RaffleResultsService } from './raffle-results.service';
import { RaffleService } from './raffle.service';

describe('RaffleResultsService', () => {
  let service: RaffleResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaffleResultsService,
        { provide: getRepositoryToken(RaffleResult), useValue: {} },
        { provide: RaffleService, useValue: {} },
      ],
    }).compile();

    service = module.get<RaffleResultsService>(RaffleResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
