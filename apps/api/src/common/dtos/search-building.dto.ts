import { IsString } from 'class-validator';
import { SearchDto } from './search.dto';

import { SearchBuildingUsers } from '@parking-system/libs';

export class SearchBuildingDto
  extends SearchDto
  implements SearchBuildingUsers
{
  @IsString()
  buildingId: string;
}
