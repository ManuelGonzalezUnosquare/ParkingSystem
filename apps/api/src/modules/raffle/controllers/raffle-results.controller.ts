import { CurrentUser } from '@common/decorators';
import { CacheEvictInterceptor } from '@common/interceptors';
import { User } from '@database/entities';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RaffleResultToModel } from '../mappers';
import { RaffleResultsService } from '../services';
import { SearchRaffleResultsDto } from '@common/dtos';

@ApiTags('results')
@Controller('results')
@UseInterceptors(CacheEvictInterceptor)
export class RaffleResultsController {
  constructor(private readonly service: RaffleResultsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get results for the raffle',
  })
  async findNext(
    @Query() filters: SearchRaffleResultsDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.service.findResultsByRaffle(filters, user);

    return {
      meta: result.meta,
      data: result.data.map((f) => RaffleResultToModel(f)),
    };

    // const raffle = await this.raffleService.findNext(buildingId, user);
    // if (!raffle) throw new NotFoundException('No pending raffle found');
    // return RaffleToModel(raffle);
  }
}
