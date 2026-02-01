import { jest } from "@jest/globals";

jest.mock("../database/entities/user.entity", () => ({
  User: class User {},
}));

jest.mock("../database/entities/building.entity", () => ({
  Building: class Building {},
}));

jest.mock("../database/entities/parking-slot.entity", () => ({
  ParkingSlot: class ParkingSlot {},
}));

jest.mock("../database/entities/parking-slot.entity", () => ({
  ParkingSlot: class ParkingSlot {},
}));
