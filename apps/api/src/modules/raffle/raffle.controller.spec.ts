import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';

describe('RaffleController', () => {
  let controller: RaffleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: RaffleService, useValue: {} }],
      controllers: [RaffleController],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
