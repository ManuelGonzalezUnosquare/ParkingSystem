import { SearchRaffleResults } from '@parking-system/libs';
import { SearchDto } from './search.dto';
import { IsOptional, IsString } from 'class-validator';

export class SearchRaffleResultsDto
  extends SearchDto
  implements SearchRaffleResults
{
  @IsString()
  raffleId: string;
  @IsString()
  @IsOptional()
  status?: string;
}
