import { Controller, Get, Post } from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { Roles, CurrentUser } from '@common/decorators';
import { User } from '@database/entities';
import { RoleEnum } from '@parking-system/libs';

@Controller('raffle')
export class RaffleController {
  constructor(private readonly raffleService: RaffleService) {}

  @Get()
  @Roles(RoleEnum.ADMIN)
  get(@CurrentUser() user: User) {
    return this.raffleService.findAll(user);
  }

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(@CurrentUser() user: User) {
    return this.raffleService.executeRaffle(user, true);
  }
}
