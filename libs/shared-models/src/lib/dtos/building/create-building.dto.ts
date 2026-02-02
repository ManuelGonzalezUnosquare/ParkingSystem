import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsInt,
  IsNotEmpty,
  Min,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateBuildingDto {
  @ApiProperty({
    description: "The unique name of the building",
    example: "North Tower",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: "The physical address of the building",
    example: "123 Business Ave, Downtown",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: "Total number of parking slots to be automatically generated",
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  totalSlots: number;
}
