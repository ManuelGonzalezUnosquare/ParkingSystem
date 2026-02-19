import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Building } from './building.entity';
import { RaffleResult } from './raffle-result.entity';
import { BaseEntity } from './_base.entity';
import { User } from './user.entity';

@Entity('raffles')
export class Raffle extends BaseEntity {
  @Column({ type: 'datetime', nullable: false })
  executionDate: Date; //estimated date

  @Column({ type: 'datetime', nullable: true })
  executedAt: Date; //executed date

  @Column({ type: 'boolean', default: false })
  isManual: boolean;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @OneToMany(() => RaffleResult, (result) => result.raffle)
  results: RaffleResult[];

  @ManyToOne(() => User, { nullable: true }) // Null null for Cron Job
  @JoinColumn({ name: 'executed_by_id' })
  executedBy: User;
}
