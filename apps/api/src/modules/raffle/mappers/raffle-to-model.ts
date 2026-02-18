import { Raffle } from '@database/entities';
import { RaffleModel } from '@parking-system/libs';
import { RaffleResultToModel } from './raffle-result-to-model';

export function RaffleToModel(raffle: Raffle): RaffleModel {
  return {
    publicId: raffle.publicId,
    executionDate: raffle.executionDate,
    executedAt: raffle.executedAt,
    isManual: raffle.isManual,
    results: (raffle.results || []).map((res) => RaffleResultToModel(res)),
  };
}
