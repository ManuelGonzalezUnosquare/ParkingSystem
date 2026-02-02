import { Test, TestingModule } from "@nestjs/testing";
import { BuildingsService } from "./buildings.service";
import {
  createMockRepository,
  MockRepository,
} from "../../test/mocks/repositories/repository.mock";
import { Building } from "../../database/entities";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("BuildingsService", () => {
  let service: BuildingsService;
  let repository: MockRepository<Building>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingsService,
        {
          provide: getRepositoryToken(Building),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<BuildingsService>(BuildingsService);
    repository = module.get<MockRepository<Building>>(
      getRepositoryToken(Building)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
