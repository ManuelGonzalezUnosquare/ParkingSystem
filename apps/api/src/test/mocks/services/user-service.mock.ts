import { jest } from "@jest/globals";
import { UsersService } from "../../../modules/users/users.service";

export type MockUserService = {
  [P in keyof UsersService]: jest.Mock<any>;
};

export const createMockUserService = (): MockUserService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByPublicId: jest.fn(),
  findOneByEmail: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});
