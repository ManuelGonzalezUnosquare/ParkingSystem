import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./_base.entity";
import { Building } from "./building.entity";
import { Role } from "./role.entity";
import { Vehicle } from "./vehicle.entity";
import { UserStatusEnum } from "@org/shared-models";

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, select: false })
  password: string;

  @Column({ type: "int", default: 0 })
  priorityScore: number;

  @Column({
    type: "enum",
    enum: UserStatusEnum,
    default: "ACTIVE",
  })
  status: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToOne(() => Building, (building) => building.users, { nullable: true })
  @JoinColumn({ name: "building_id" })
  building: Building; // NULL if ROOT

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];
}
