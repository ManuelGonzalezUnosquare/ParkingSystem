import { CacheEvict, CurrentUser, Roles } from '@common/decorators';
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
  @CacheEvict({ entity: 'users' })
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

  @Get(':publicId')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  findOne(@Param('publicId', new ParseUUIDPipe()) publicId: string) {
    return this.usersService.findOneByPublicId(publicId);
  }

  @Patch(':publicId')
  @CacheEvict({ entity: 'users', isKeySpecific: true })
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  async update(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() updateUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.usersService.update(
      publicId,
      updateUserDto,
      user,
    );
    return UserEntityToModel(response);
  }

  @Delete(':publicId')
  @CacheEvict({ entity: 'users', isKeySpecific: true })
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('publicId', new ParseUUIDPipe()) publicId: string) {
    return this.usersService.remove(publicId);
  }
}
