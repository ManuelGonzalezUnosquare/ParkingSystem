import { Test, TestingModule } from '@nestjs/testing';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { Building } from '@database/entities';

describe('BuildingsController', () => {
  let controller: BuildingsController;
  let service: jest.Mocked<BuildingsService>;
  let testingModule: TestingModule;

  const mockBuildingEntity: any = {
    id: 1,
    publicId: 'b-uuid-123',
    name: 'Tower North',
    address: 'Main St 123',
  };

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [BuildingsController],
      providers: [
        {
          provide: BuildingsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneByPublicId: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = testingModule.get<BuildingsController>(BuildingsController);
    service = testingModule.get(BuildingsService);
  });

  describe('create', () => {
    it('should call service.create and return mapped model', async () => {
      const dto: any = { name: 'Tower North', address: 'Main St 123' };
      service.create.mockResolvedValue({
        publicId: mockBuildingEntity.publicId,
        name: mockBuildingEntity.name,
        address: mockBuildingEntity.address,
      } as Building);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.publicId).toBe(mockBuildingEntity.publicId);
    });
  });

  describe('findAll', () => {
    it('should return paginated data mapped to models', async () => {
      service.findAll.mockResolvedValue({
        data: [mockBuildingEntity],
        meta: { totalItems: 1 } as any,
      });

      const result = await controller.findAll({} as any);

      expect(result.data[0].publicId).toBe(mockBuildingEntity.publicId);
    });
  });

  describe('findOne', () => {
    it('should call service with publicId and return model', async () => {
      service.findOneByPublicId.mockResolvedValue(mockBuildingEntity);

      const result = await controller.findOne('b-uuid-123');

      expect(service.findOneByPublicId).toHaveBeenCalledWith('b-uuid-123');
      expect(result.name).toBe(mockBuildingEntity.name);
    });
  });
});
