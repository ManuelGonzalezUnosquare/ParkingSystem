import { Entity, Column, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "./_base.entity";

@Entity("roles")
export class Role extends BaseEntity {
  @Column({ type: "varchar", length: 50, unique: true })
  name: string; // 'ROOT', 'ADMIN', 'USER'

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
