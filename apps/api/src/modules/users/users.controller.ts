import { CurrentUser, Roles } from '@common/decorators';
import { SearchBuildingDto } from '@common/dtos';
import { User } from '@database/entities';
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
import { CreateUserDto } from '../auth/dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  findAll(@Query() searchDto: SearchBuildingDto, @CurrentUser() user: User) {
    return this.usersService.findAll(searchDto, user);
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
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
