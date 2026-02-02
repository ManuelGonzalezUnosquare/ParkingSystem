import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./_base.entity";
import { ParkingSlot } from "./parking-slot.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity("vehicles")
export class Vehicle extends BaseEntity {
  @Column({ type: "varchar", length: 20, unique: true })
  licensePlate: string;

  @Column({ type: "varchar", length: 100 })
  description: string;

  @ManyToOne(() => User, (user) => user.vehicles)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(() => ParkingSlot, (slot) => slot.vehicle, { nullable: true })
  @JoinColumn({ name: "slotId" })
  @ApiProperty({ type: () => ParkingSlot, nullable: true })
  slot: ParkingSlot | null;
}
