import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: jest.Mocked<RaffleService>;
  let testingModule: TestingModule;

  const mockUser: any = { id: 1, building: { id: 10, publicId: 'b-123' } };

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
      service.executeRaffleManually.mockResolvedValue(undefined);

      const result = await controller.execute(mockUser);

      expect(service.executeRaffleManually).toHaveBeenCalledWith(mockUser);
      expect(result.message).toContain('successfully');
    });
  });

  describe('findNext', () => {
    it('should return a mapped raffle model', async () => {
      const mockRaffle = { id: 1, building: { id: 10 } };
      service.findNext.mockResolvedValue(mockRaffle as any);

      const result = await controller.findNext(mockUser);

      expect(service.findNext).toHaveBeenCalledWith(mockUser);
      expect(result).toBeDefined();
    });
  });

  describe('findByBuilding', () => {
    it('should call findAll with buildingId from param', async () => {
      const buildingId = 'uuid-building';
      service.findAll.mockResolvedValue([]);

      await controller.findByBuilding(buildingId, mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, buildingId);
    });
  });
});
