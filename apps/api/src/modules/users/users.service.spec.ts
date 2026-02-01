import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserStatusEnum } from "@org/shared-models";
import { User } from "../../database/entities/user.entity";
import {
  createMockRepository,
  MockRepository,
} from "../../test/mocks/repositories/repository.mock";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  //mock del repo
  // const mockUser = {
  //   id: 1,
  //   publicId: "some-uuid",
  //   email: "test@test.com",
  //   status: UserStatusEnum.ACTIVE,
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOneByPublicId", () => {
    it("should return a user if found", async () => {
      const mockUser = { id: 1, publicId: "uuid-123", email: "test@test.com" };
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneByPublicId("uuid-123");

      expect(repository.findOneBy).toHaveBeenCalledWith({
        publicId: "uuid-123",
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null and log warning if user not found", async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findOneByPublicId("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    const createUserDto = {
      email: "new@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      status: UserStatusEnum.ACTIVE,
    };

    it("should throw ConflictException if user already exists", async () => {
      repository.exists.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );

      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should successfully create a user if it does not exist", async () => {
      repository.exists.mockResolvedValue(false);

      const savedUser = { id: 1, ...createUserDto };
      repository.create.mockReturnValue(savedUser);
      repository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(result).toEqual(savedUser);
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException if save fails unexpectedly", async () => {
      repository.exists.mockResolvedValue(false);
      repository.create.mockReturnValue(createUserDto);

      repository.save.mockRejectedValue(new Error("DB Crash"));

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
