import { CurrentUser, Roles } from '@common/decorators';
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
} from '@nestjs/common';
import { RaffleModel, RaffleResultModel, RoleEnum } from '@parking-system/libs';
import { RaffleResultToModel, RaffleToModel } from './mappers';
import { RaffleService } from './raffle.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('raffle')
@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get('next')
  @ApiOperation({
    summary: 'Get the next scheduled raffle for the user building',
  })
  async findNext(@CurrentUser() user: User): Promise<RaffleModel> {
    const raffle = await this.raffleService.findNext(user);
    if (!raffle) throw new NotFoundException('No pending raffle found');
    return RaffleToModel(raffle);
  }
  @Get('history')
  @ApiOperation({ summary: 'Get raffle history for the current user' })
  async findHistory(@CurrentUser() user: User): Promise<RaffleResultModel[]> {
    const results = await this.raffleService.findHistory(user);
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

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Manually trigger the current pending raffle' })
  async execute(@CurrentUser() user: User) {
    await this.raffleService.executeRaffle(user, true);
    return {
      message: 'Raffle executed successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
