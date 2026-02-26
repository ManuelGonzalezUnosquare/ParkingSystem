import { Test, TestingModule } from '@nestjs/testing';
import { BuildingsService } from './buildings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Building } from '@database/entities';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BuildingsService', () => {
  let service: BuildingsService;
  let repo: any;
  let testingModule: TestingModule;

  const mockBuilding = {
    id: 1,
    publicId: 'b-1',
    name: 'Tower A',
    address: '123 St',
  };

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        BuildingsService,
        {
          provide: getRepositoryToken(Building),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = testingModule.get<BuildingsService>(BuildingsService);
    repo = testingModule.get(getRepositoryToken(Building));
  });

  describe('create', () => {
    it('should create a building if name is unique', async () => {
      repo.findOneBy.mockResolvedValue(null);
      repo.create.mockReturnValue(mockBuilding);
      repo.save.mockResolvedValue(mockBuilding);

      const result = await service.create({
        name: 'Tower A',
        address: '123 St',
        totalSlots: 10,
      });
      expect(result).toEqual(mockBuilding);
    });

    it('should throw ConflictException if name exists', async () => {
      repo.findOneBy.mockResolvedValue(mockBuilding);
      await expect(service.create({ name: 'Tower A' } as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should merge and save updated data', async () => {
      repo.findOneBy.mockResolvedValue(mockBuilding);
      repo.merge.mockReturnValue({ ...mockBuilding, name: 'Updated Name' });
      repo.save.mockResolvedValue({ ...mockBuilding, name: 'Updated Name' });

      const result = await service.update('b-1', { name: 'Updated Name' });
      expect(repo.merge).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should call softDelete with internal id', async () => {
      repo.findOneBy.mockResolvedValue(mockBuilding);
      await service.remove('b-1');
      expect(repo.softDelete).toHaveBeenCalledWith(mockBuilding.id);
    });

    it('should throw NotFoundException if building not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
