import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from '../services';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: jest.Mocked<RaffleService>;
  let testingModule: TestingModule;

  const mockUser: any = {
    id: 1,
    publicId: 'uuid-123',
    email: 'test@test.com',
    role: {
      name: '',
    },
  };

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [RaffleController],
      providers: [
        {
          provide: RaffleService,
          useValue: {
            findNext: jest.fn(),
            findHistory: jest.fn(),
            findAll: jest.fn(),
            executeRaffleManually: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = testingModule.get<RaffleController>(RaffleController);
    service = testingModule.get(RaffleService);
  });

  describe('execute', () => {
    it('should call executeRaffleManually', async () => {
      const raffleResult = {
        executed: {} as any,
        upcoming: {} as any,
      };
      service.executeRaffleManually.mockResolvedValue(raffleResult);

      const result = await controller.execute('123', mockUser);

      expect(service.executeRaffleManually).toHaveBeenCalledWith(
        '123',
        mockUser,
      );
      expect(result.executed).not.toBeNull();
    });
  });

  describe('findNext', () => {
    it('should return a mapped raffle model', async () => {
      const mockRaffle = { id: 1, building: { id: 10, publicId: '123-a' } };
      service.findNext.mockResolvedValue(mockRaffle as any);

      const result = await controller.findNext('123-1', mockUser);

      expect(service.findNext).toHaveBeenCalledWith('123-1', mockUser);
      expect(result).toBeDefined();
    });
  });
});
