import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { RoleEnum } from '@parking-system/libs';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Building } from '../../database/entities';
import { Roles } from '../../common/decorators';
import { CreateBuildingDto } from './dtos/create-building.dto';

@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(RoleEnum.ROOT)
  @ApiOperation({ summary: 'Create a new building and generate its slots' })
  @ApiCreatedResponse({
    description: 'The building has been successfully created.',
    type: Building,
  })
  @ApiConflictResponse({
    description: 'A building with this name already exists.',
  })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
  }

  @Get()
  @Roles(RoleEnum.ROOT)
  findAll() {
    return this.buildingsService.findAll();
  }

  @Get(':publicId')
  @Roles(RoleEnum.ROOT, RoleEnum.ADMIN)
  findOne(@Param('publicId', new ParseUUIDPipe()) publicId: string) {
    return this.buildingsService.findOneByPublicId(publicId);
  }

  @Patch(':publicId')
  @Roles(RoleEnum.ROOT)
  update(
    @Param('publicId', new ParseUUIDPipe()) publicId: string,
    @Body() updateBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingsService.update(publicId, updateBuildingDto);
  }

  @Delete(':publicId')
  @Roles(RoleEnum.ROOT)
  remove(@Param('publicId', new ParseUUIDPipe()) publicId: string) {
    return this.buildingsService.remove(publicId);
  }
}
