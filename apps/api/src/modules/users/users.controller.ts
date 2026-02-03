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
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "@org/shared-models";
import { CurrentUser } from "../../common/decorators";
import { User } from "../../database/entities";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
    console.log("user", user);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.findOneByPublicId(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: Partial<CreateUserDto>
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
