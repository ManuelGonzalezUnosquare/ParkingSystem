import { CacheEvict, CurrentUser, Roles } from '@common/decorators';
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
  UseInterceptors,
} from '@nestjs/common';
import {
  RaffleExecutionResultModel,
  RaffleModel,
  RaffleResultModel,
  RoleEnum,
} from '@parking-system/libs';
import { RaffleResultToModel, RaffleToModel } from './mappers';
import { RaffleService } from './services/raffle.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheEvictInterceptor } from '@common/interceptors';

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
  ): Promise<RaffleResultModel[]> {
    const results = await this.raffleService.findHistory(buildingId, user);
    return results.map(RaffleResultToModel);
  }

  @Get('/:buildingId')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @ApiOperation({
    summary: 'Get all raffles associated with a specific building',
  })
  async findByBuilding(
    @Param('buildingId', new ParseUUIDPipe()) buildingId: string,
    @CurrentUser() user: User,
  ): Promise<RaffleModel[]> {
    const raffles = await this.raffleService.findAll(user, buildingId);
    return raffles.map(RaffleToModel);
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
