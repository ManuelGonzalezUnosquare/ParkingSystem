import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";
import { Raffle } from "./raffle.entity";
import { User } from "./user.entity";
import { ParkingSlot } from "./parking-slot.entity";
import { BaseEntity } from "./_base.entity";
import { Vehicle } from "./vehicle.entity";

@Entity("raffle_results")
export class RaffleResult extends BaseEntity {
  @ManyToOne(() => Raffle, (raffle) => raffle.results)
  @JoinColumn({ name: "raffle_id" })
  raffle: Raffle;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: "vehicle_id" })
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSlot)
  @JoinColumn({ name: "slot_id" })
  slot: ParkingSlot;

  @Column({ type: "int" })
  scoreAtDraw: number;
}
