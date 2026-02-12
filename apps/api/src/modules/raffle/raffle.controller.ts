import { CurrentUser, Roles } from '@common/decorators';
import { User } from '@database/entities';
import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { RoleEnum } from '@parking-system/libs';
import { RaffleResultToModel, RaffleToModel } from './mappers';
import { RaffleService } from './raffle.service';

@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get('next')
  findNext(@CurrentUser() user: User) {
    return this.raffleService.findNext(user);
  }

  @Get('history')
  async findHistory(@CurrentUser() user: User) {
    const response = await this.raffleService.findHistory(user);

    return response.map((res) => RaffleResultToModel(res));
  }

  @Get(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.raffleService.findAll(user, id);

    return result.map((r) => RaffleToModel(r));
  }

  @Post()
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  create(@CurrentUser() user: User) {
    return this.raffleService.executeRaffle(user, true);
  }
}
