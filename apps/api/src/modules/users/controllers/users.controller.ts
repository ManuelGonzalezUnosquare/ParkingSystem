import { CurrentUser, Roles } from '@common/decorators';
import { SearchBuildingDto } from '@common/dtos';
import { User } from '@database/entities';
import { CreateUserDto } from '@modules/auth/dtos';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@parking-system/libs';
import { UserEntityToModel } from '../mappers';
import { UsersService } from '../services';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.usersService.create(createUserDto, user);
    return UserEntityToModel(response);
  }

  @Get()
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  async findAll(
    @Query() searchDto: SearchBuildingDto,
    @CurrentUser() user: User,
  ) {
    const searchResult = await this.usersService.findAll(searchDto, user);
    return {
      meta: searchResult.meta,
      data: searchResult.data.map((user) => UserEntityToModel(user)),
    };
  }

  @Get(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOneByPublicId(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
