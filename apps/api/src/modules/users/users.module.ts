import { Role, User } from '@database/entities';
import { BuildingsModule } from '@modules/buildings/buildings.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService, UsersService } from './services';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { UsersController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    BuildingsModule,
    VehiclesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RoleService],
  exports: [UsersService],
})
export class UsersModule {}
