import { CacheEvict, CurrentUser, Roles } from '@common/decorators';
import { SearchDto } from '@common/dtos';
import { CacheEvictInterceptor } from '@common/interceptors';
import { User } from '@database/entities';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  RaffleExecutionResultModel,
  RaffleModel,
  RoleEnum,
} from '@parking-system/libs';
import { RaffleToModel } from '../mappers';
import { RaffleService } from '../services';

@ApiTags('raffle')
@Controller('raffle')
@UseInterceptors(CacheEvictInterceptor)
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get(':buildingId/next')
  @ApiOperation({
    summary: 'Get the next scheduled raffle for the user building',
  })
  async findNext(
    @Param('buildingId', new ParseUUIDPipe()) buildingId: string,
    @CurrentUser() user: User,
  ): Promise<RaffleModel> {
    const raffle = await this.raffleService.findNext(buildingId, user);
    if (!raffle) throw new NotFoundException('No pending raffle found');
    return RaffleToModel(raffle);
  }
  @Get(':buildingId/history')
  @ApiOperation({ summary: 'Get raffle history for the current user' })
  async findHistory(
    @Param('buildingId', new ParseUUIDPipe()) buildingId: string,
    @CurrentUser() user: User,
    @Query() searchDto: SearchDto,
  ) {
    const results = await this.raffleService.findHistory(
      buildingId,
      user,
      searchDto,
    );
    return results;
  }

  @Get(':raffleId')
  async findById(@Param('raffleId', new ParseUUIDPipe()) raffleId: string) {
    const raffle = await this.raffleService.findByPublicId(raffleId);
    if (!raffle) throw new NotFoundException('No raffle found');
    return RaffleToModel(raffle);
  }

  @Post(':buildingId/execute')
  @CacheEvict({ entity: 'raffles' })
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Manually trigger the current pending raffle' })
  async execute(
    @Param('buildingId', new ParseUUIDPipe()) buildingId: string,
    @CurrentUser() user: User,
  ) {
    const executionResult = await this.raffleService.executeRaffleManually(
      buildingId,
      user,
    );

    const result: RaffleExecutionResultModel = {
      executed: RaffleToModel(executionResult.executed),
      upcoming: RaffleToModel(executionResult.upcoming),
    };

    return result;
  }
}
