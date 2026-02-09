import { Role, User } from '@database/entities';
import { BuildingsModule } from '@modules/buildings/buildings.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { RoleService, UsersService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), BuildingsModule],
  controllers: [UsersController],
  providers: [UsersService, RoleService],
  exports: [UsersService],
})
export class UsersModule {}
