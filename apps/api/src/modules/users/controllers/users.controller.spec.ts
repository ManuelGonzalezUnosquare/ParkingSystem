import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from '../services';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;
  let testingModule: TestingModule;

  const mockUserEntity: any = {
    id: 1,
    publicId: 'uuid-123',
    email: 'test@test.com',
    role: {
      name: '',
    },
  };

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
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

    controller = testingModule.get<UsersController>(UsersController);
    service = testingModule.get(UsersService);
  });

  describe('create', () => {
    it('should call service.create and return a model', async () => {
      const dto: any = { email: 'test@test.com' };
      service.create.mockResolvedValue(mockUserEntity);

      const result = await controller.create(dto, mockUserEntity);

      expect(service.create).toHaveBeenCalledWith(dto, mockUserEntity);
      expect(result.email).toBe(mockUserEntity.email);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const searchDto: any = { buildingId: 'b-1' };
      service.findAll.mockResolvedValue({
        data: [mockUserEntity],
        meta: { total: 1 } as any,
      });

      const result = await controller.findAll(searchDto, mockUserEntity);

      expect(result.data[0].email).toBe(mockUserEntity.email);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a user model', async () => {
      service.findOneByPublicId.mockResolvedValue(mockUserEntity);

      const result = await controller.findOne('uuid-123');

      expect(service.findOneByPublicId).toHaveBeenCalledWith('uuid-123');
      expect(result.publicId).toBe('uuid-123');
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove('uuid-123');
      expect(service.remove).toHaveBeenCalledWith('uuid-123');
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { User } from '@database/entities';
// import { createMockRepository } from '@test/mocks/repositories/repository.mock';
// import {
//   MockCryptoService,
//   createMockCryptoService,
// } from '@test/mocks/services';
// import { CryptoService } from '@utils/services';
//
// describe('UsersController', () => {
//   let controller: UsersController;
//
//   let cryptoService: MockCryptoService;
//   let service: UsersService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         UsersService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: createMockRepository(),
//         },
//         {
//           provide: CryptoService,
//           useValue: createMockCryptoService(),
//         },
//       ],
//     }).compile();
//
//     controller = module.get<UsersController>(UsersController);
//     service = module.get<UsersService>(UsersService);
//     cryptoService = module.get<MockCryptoService>(CryptoService);
//   });
//
//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
