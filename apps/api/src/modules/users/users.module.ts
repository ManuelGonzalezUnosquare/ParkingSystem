import { Role, User } from '@database/entities';
import { BuildingsModule } from '@modules/buildings/buildings.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers';
import { RoleService, UsersCacheService, UsersService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    BuildingsModule,
    VehiclesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RoleService, UsersCacheService],
  exports: [UsersService],
})
export class UsersModule {}
