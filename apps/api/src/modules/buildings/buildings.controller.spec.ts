import { Test, TestingModule } from "@nestjs/testing";
import { BuildingsController } from "./buildings.controller";
import { BuildingsService } from "./buildings.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Building } from "../../database/entities";
import { createMockRepository } from "../../test/mocks/repositories/repository.mock";

describe("BuildingsController", () => {
  let controller: BuildingsController;
  let service: BuildingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingsController],
      providers: [
        BuildingsService,
        {
          provide: getRepositoryToken(Building),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<BuildingsController>(BuildingsController);
    service = module.get<BuildingsService>(BuildingsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
