import { RaffleResult } from '@database/entities';
import { RaffleResultModel } from '@parking-system/libs';

export function RaffleResultToModel(result: RaffleResult): RaffleResultModel {
  return {
    publicId: result.publicId,
    raffleId: result.publicId,
    userName: `${result.user.firstName} ${result.user.lastName}`,
    userScoreAtDraw: result.scoreAtDraw,
    vehicleDescription: result.vehicle.description,
    vehiclePlate: result.vehicle.licensePlate,
    slotNumber: result.slot.slotNumber,
  };
}
