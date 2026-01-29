import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./_base.entity";

@Entity("vehicles")
export class Vehicle extends BaseEntity {
  @Column({ type: "varchar", length: 20, unique: true })
  licensePlate: string;

  @Column({ type: "varchar", length: 100 })
  description: string;

  @ManyToOne(() => User, (user) => user.vehicles)
  @JoinColumn({ name: "user_id" })
  user: User;
}
