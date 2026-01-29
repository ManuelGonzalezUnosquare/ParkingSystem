import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Building } from "./building.entity";
import { RaffleResult } from "./raffle-result.entity";
import { BaseEntity } from "./_base.entity";

@Entity("raffles")
export class Raffle extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name: string; // Ej: "Sorteo Mensual - Marzo 2026"

  @Column({ type: "datetime" })
  drawDate: Date;

  @Column({ type: "boolean", default: false })
  isCompleted: boolean;

  @ManyToOne(() => Building)
  @JoinColumn({ name: "building_id" })
  building: Building;

  @OneToMany(() => RaffleResult, (result) => result.raffle)
  results: RaffleResult[];
}
