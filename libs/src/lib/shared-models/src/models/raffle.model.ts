import { BaseModel } from './base.model';
import { RaffleResultModel } from './raffle-result.model';

export class RaffleModel extends BaseModel {
  executionDate: Date; //estimated date
  executedAt: Date; //executed date
  isManual: boolean;
  results: RaffleResultModel[];
}
