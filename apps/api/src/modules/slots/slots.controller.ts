import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParkingSlot } from '@database/entities';

@ApiTags('slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get('building/:buildingId')
  @ApiOperation({ summary: 'Get all slots for a specific building' })
  @ApiOkResponse({ type: [ParkingSlot] })
  findAllByBuilding(
    @Param('buildingId', new ParseUUIDPipe()) buildingId: string,
  ) {
    return this.slotsService.findAllByBuilding(buildingId);
  }

  @Get('building/:buildingId/available')
  @ApiOperation({ summary: 'Get only available slots for a building' })
  @ApiOkResponse({ type: [ParkingSlot] })
  findAvailable(@Param('buildingId', new ParseUUIDPipe()) buildingId: string) {
    return this.slotsService.findAvailableByBuilding(buildingId);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get details of a specific slot' })
  @ApiOkResponse({ type: ParkingSlot })
  findOne(@Param('publicId', new ParseUUIDPipe()) publicId: string) {
    return this.slotsService.findOneByPublicId(publicId);
  }
}
