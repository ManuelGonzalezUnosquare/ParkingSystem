import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { BuildingsService } from "./buildings.service";
import { CreateBuildingDto, UpdateBuildingDto } from "@org/shared-models";
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { Building } from "../../database/entities";

@Controller("buildings")
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new building and generate its slots" })
  @ApiCreatedResponse({
    description: "The building has been successfully created.",
    type: Building,
  })
  @ApiConflictResponse({
    description: "A building with this name already exists.",
  })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
  }

  @Get()
  findAll() {
    return this.buildingsService.findAll();
  }

  @Get(":publicId")
  findOne(@Param("publicId", new ParseUUIDPipe()) publicId: string) {
    return this.buildingsService.findOneByPublicId(publicId);
  }

  @Patch(":publicId")
  update(
    @Param("publicId", new ParseUUIDPipe()) publicId: string,
    @Body() updateBuildingDto: UpdateBuildingDto
  ) {
    return this.buildingsService.update(publicId, updateBuildingDto);
  }

  @Delete(":publicId")
  remove(@Param("publicId", new ParseUUIDPipe()) publicId: string) {
    return this.buildingsService.remove(publicId);
  }
}
