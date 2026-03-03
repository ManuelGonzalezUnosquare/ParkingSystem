import { Search } from './search.interface';

export interface SearchRaffleResults extends Search {
  raffleId: string;
  status?: string;
}
