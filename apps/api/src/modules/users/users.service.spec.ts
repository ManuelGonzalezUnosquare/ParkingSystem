jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password_123"),
  genSalt: jest.fn().mockResolvedValue("salt_123"),
}));
import * as bcrypt from "bcrypt";
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
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

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const mockUsers = [
        { id: 1, email: "u1@test.com" },
        { id: 2, email: "u2@test.com" },
      ];
      repository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });
  });

  describe("findOneById", () => {
    it("should return a user by numeric ID", async () => {
      const mockUser = { id: 1, email: "test@test.com" };
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user by ID is not found", async () => {
      repository.findOneBy.mockResolvedValue(null);
      const result = await service.findOneById(999);
      expect(result).toBeNull();
    });
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

    it("should successfully create a user with a hashed password", async () => {
      const rawPassword = "password123";
      const dtoWithRawPassword = { ...createUserDto, password: rawPassword };

      repository.exists.mockResolvedValue(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository.create.mockImplementation((data: any) => ({ id: 1, ...data }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository.save.mockImplementation((user: any) => Promise.resolve(user));

      const result = await service.create(dtoWithRawPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(rawPassword, 10);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashed_password_123",
        })
      );

      expect(result.password).toBe("hashed_password_123");
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

  describe("update", () => {
    const publicId = "uuid-123";
    const updateDto = { firstName: "Jane" };
    const existingUser = {
      id: 1,
      publicId,
      email: "test@test.com",
      firstName: "John",
    };

    it("should successfully update a user", async () => {
      repository.findOneBy.mockResolvedValue(existingUser);
      const savedUser = { ...existingUser, ...updateDto };
      repository.save.mockResolvedValue(savedUser);

      const result = await service.update(publicId, updateDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto)
      );
      expect(result.firstName).toBe("Jane");
    });

    it("should throw NotFoundException if user to update does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(publicId, updateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw InternalServerErrorException if update fails", async () => {
      repository.findOneBy.mockResolvedValue(existingUser);
      repository.save.mockRejectedValue(new Error("Update failed"));

      await expect(service.update(publicId, updateDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe("remove", () => {
    const publicId = "uuid-123";
    const existingUser = {
      id: 1,
      publicId,
      email: "test@test.com",
      deletedAt: "today",
    };

    it("should successfully remove a user", async () => {
      repository.findOneBy.mockResolvedValue(existingUser);
      repository.softDelete.mockResolvedValue(existingUser);

      await service.remove(publicId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ publicId });
      expect(repository.softDelete).toHaveBeenCalledWith(existingUser);
    });

    it("should throw NotFoundException if user to remove does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(publicId)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException if removal fails", async () => {
      repository.findOneBy.mockResolvedValue(existingUser);
      repository.softDelete.mockRejectedValue(new Error("Delete failed"));

      await expect(service.remove(publicId)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
