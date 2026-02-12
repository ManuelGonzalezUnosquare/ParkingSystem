import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { Roles, CurrentUser } from '@common/decorators';
import { User } from '@database/entities';
import { RoleEnum } from '@parking-system/libs';

@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.raffleService.findAll(user, id);
  }

  @Post()
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  create(@CurrentUser() user: User) {
    return this.raffleService.executeRaffle(user, true);
  }
}
