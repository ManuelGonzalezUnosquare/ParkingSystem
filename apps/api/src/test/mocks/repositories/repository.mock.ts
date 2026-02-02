/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals";
import { Repository } from "typeorm";

export type MockRepository<T = any> = {
  [P in keyof Repository<T>]: jest.Mock<any, any>;
};

export const createMockRepository = (): MockRepository =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    update: jest.fn(),
    softDelete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    }),
  } as any);
