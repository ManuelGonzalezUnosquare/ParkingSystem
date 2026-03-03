import { BaseModel } from './base.model';

export class RaffleHistoryModel extends BaseModel {
  plannedDate: string;
  executedDate: string;
  availableSpots: string;
  status: string;
  isManual: boolean;
  executedBy: string;

  totalParticipants: number;
  winnersCount: number;
  losersCount: number;
  excludedCount: number;
}
