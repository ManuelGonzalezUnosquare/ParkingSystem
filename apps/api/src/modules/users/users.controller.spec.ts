import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../database/entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { createMockRepository } from "../../test/mocks/repositories/repository.mock";

describe("UsersController", () => {
  let controller: UsersController;

  let service: UsersService;

  // Mock del repositorio

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          // Aquí le decimos a Nest: "Cuando alguien pida el repo de UserEntity, dale mi mock"
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
