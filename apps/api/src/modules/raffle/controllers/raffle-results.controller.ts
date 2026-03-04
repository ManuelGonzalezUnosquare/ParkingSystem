import { CurrentUser } from '@common/decorators';
import { CacheEvictInterceptor } from '@common/interceptors';
import { User } from '@database/entities';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RaffleResultToModel } from '../mappers';
import { RaffleResultsService } from '../services';
import { SearchDto, SearchRaffleResultsDto } from '@common/dtos';

@ApiTags('results')
@Controller('results')
@UseInterceptors(CacheEvictInterceptor)
export class RaffleResultsController {
  constructor(private readonly service: RaffleResultsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get results for the raffle',
  })
  async getAllResults(
    @Query() filters: SearchRaffleResultsDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.service.findResultsByRaffle(filters, user);

    return {
      meta: result.meta,
      data: result.data.map((f) => RaffleResultToModel(f)),
    };
  }
  @Get('user')
  @ApiOperation({
    summary: 'Get results for the user',
  })
  async getResultsByUser(
    @Query() filters: SearchDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.service.findResultsByUser(filters, user);

    return {
      meta: result.meta,
      data: result.data.map((f) => RaffleResultToModel(f)),
    };
  }
}
