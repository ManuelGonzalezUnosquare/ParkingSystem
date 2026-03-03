import { Test, TestingModule } from '@nestjs/testing';
import { RaffleResultsController } from './raffle-results.controller';
import { RaffleResultsService } from '../services';

describe('RaffleHistoryController', () => {
  let controller: RaffleResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleResultsController],
      providers: [
        {
          provide: RaffleResultsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RaffleResultsController>(RaffleResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
