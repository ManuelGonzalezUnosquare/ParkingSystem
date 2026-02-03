import { Test, TestingModule } from "@nestjs/testing";
import { SlotsController } from "./slots.controller";
import { SlotsService } from "./slots.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ParkingSlot } from "../../database/entities";
import { createMockRepository } from "../../test/mocks/repositories/repository.mock";

describe("SlotsController", () => {
  let controller: SlotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotsController],
      providers: [
        SlotsService,
        {
          provide: getRepositoryToken(ParkingSlot),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<SlotsController>(SlotsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
