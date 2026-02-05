import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  type Relation,
} from "typeorm";
import { Building } from "./building.entity";
import { BaseEntity } from "./_base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Vehicle } from "./vehicle.entity";

@Entity("parking_slots")
export class ParkingSlot extends BaseEntity {
  @Column({ type: "varchar", length: 20 })
  slotNumber: string; // Ej: A-01, B-50

  @Column({ type: "boolean", default: true })
  isAvailable: boolean;

  @ManyToOne(() => Building, (building) => building.slots)
  @JoinColumn({ name: "building_id" })
  building: Relation<Building>;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.slot, { nullable: true })
  @ApiProperty({ type: () => Vehicle, nullable: true })
  vehicle: Relation<Vehicle | null>;
}
