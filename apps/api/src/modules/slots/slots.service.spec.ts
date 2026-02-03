import { Test, TestingModule } from "@nestjs/testing";
import { SlotsService } from "./slots.service";
import { ParkingSlot } from "../../database/entities";
import { getRepositoryToken } from "@nestjs/typeorm";
import { createMockRepository } from "../../test/mocks/repositories/repository.mock";

describe("SlotsService", () => {
  let service: SlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        {
          provide: getRepositoryToken(ParkingSlot),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
