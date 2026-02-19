/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@database/entities';
import { BuildingsService } from '@modules/buildings/buildings.service';
import { VehiclesService } from '@modules/vehicles/vehicles.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CryptoService } from '@utils/services';
import { RoleService } from './role.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;
  let queryRunner: any;
  let testingModule: TestingModule;
  let buildingService: BuildingsService;
  let roleService: RoleService;
  let vehicleService: VehiclesService;

  const mockBuilding = {
    id: 1,
    publicId: 'uuid-123',
    building: { publicId: 'b-1' },
    name: '',
    totalSlots: 10,
    address: '',
    users: [],
    slots: [],
    createdAt: '',
    updatedAt: '',
    deletedAt: '',
  };
  const mockRole = {
    id: 1,
    publicId: '',
    name: '',
    description: '',
    users: [],
    createdAt: '',
    updatedAt: '',
    deletedAt: '',
  };
  const mockUser = {
    id: 1,
    email: 'test@test.com',
    publicId: 'uuid-123',
    building: { publicId: 'b-1' },
    role: mockRole,
  };
  const mockVehicle = {
    id: 1,
    publicId: '123',
    licensePlate: '123',
    description: 'lorem',
    slot: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: '',
  } as any;
  const createMockQueryRunner = () => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  });

  beforeEach(async () => {
    queryRunner = createMockQueryRunner();

    testingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            exists: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            softDelete: jest.fn(),
            increment: jest.fn(),
            createQueryBuilder: jest.fn(),
            manager: {
              connection: {
                createQueryRunner: jest.fn().mockReturnValue(queryRunner),
              },
            },
          },
        },
        {
          provide: VehiclesService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findByPlate: jest.fn(),
          },
        },
        {
          provide: BuildingsService,
          useValue: { findOneByPublicId: jest.fn() },
        },
        { provide: RoleService, useValue: { findByName: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('secret') },
        },
        {
          provide: CryptoService,
          useValue: { hash: jest.fn().mockResolvedValue('hashed') },
        },
      ],
    }).compile();

    service = testingModule.get<UsersService>(UsersService);
    repo = testingModule.get(getRepositoryToken(User));
    buildingService = testingModule.get<BuildingsService>(BuildingsService);
    roleService = testingModule.get<RoleService>(RoleService);
    vehicleService = testingModule.get<VehiclesService>(VehiclesService);
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    const createUserDto: any = {
      email: 'new@test.com',
      buildingId: 'b-1',
      role: 'admin',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a user successfully with transaction', async () => {
      repo.exists.mockResolvedValue(false);
      jest
        .spyOn(buildingService, 'findOneByPublicId')
        .mockResolvedValue(mockBuilding);
      jest.spyOn(roleService, 'findByName').mockResolvedValue(mockRole);
      jest.spyOn(vehicleService, 'findByPlate').mockResolvedValue(null);

      repo.create.mockReturnValue(mockUser);
      queryRunner.manager.save.mockResolvedValue(mockUser);
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto, mockUser as any);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should rollback transaction on error', async () => {
      repo.exists.mockResolvedValue(false);
      jest
        .spyOn(buildingService, 'findOneByPublicId')
        .mockResolvedValue(mockBuilding);
      jest.spyOn(roleService, 'findByName').mockResolvedValue(mockRole);

      queryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.create(createUserDto, mockUser as any),
      ).rejects.toThrow();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      repo.exists.mockResolvedValue(true);
      await expect(
        service.create(createUserDto, mockUser as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if licensePlate exists', async () => {
      jest
        .spyOn(buildingService, 'findOneByPublicId')
        .mockResolvedValue(mockBuilding);
      jest.spyOn(roleService, 'findByName').mockResolvedValue(mockRole);
      jest.spyOn(vehicleService, 'findByPlate').mockResolvedValue(mockVehicle);
      await expect(
        service.create(createUserDto, mockUser as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should throw BadRequestException if buildingId is missing', async () => {
      await expect(service.findAll({} as any, mockUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user if exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      await service.remove('uuid-123');
      expect(repo.softDelete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('uuid-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('internalUpdate', () => {
    it('should merge and save partial data', async () => {
      repo.findOneBy.mockResolvedValue(mockUser);
      repo.merge.mockReturnValue({ ...mockUser, firstName: 'Updated' });
      repo.save.mockResolvedValue({ ...mockUser, firstName: 'Updated' });
      repo.findOne.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await service.internalUpdate(1, { firstName: 'Updated' });

      expect(repo.merge).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Updated');
    });
  });

  describe('incrementPriority', () => {
    it('should call repository increment', async () => {
      await service.incrementPriority(1);
      expect(repo.increment).toHaveBeenCalledWith(
        { id: 1 },
        'priorityScore',
        1,
      );
    });
  });
});
