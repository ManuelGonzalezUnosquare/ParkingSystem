import {
  Entity,
  Column,
  OneToMany,
  type Relation,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './_base.entity';
import { User } from './user.entity';
import { ParkingSlot } from './parking-slot.entity';

@Entity('buildings')
export class Building extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'int', default: 0 })
  totalSlots: number;

  @Column()
  address: string;

  @OneToMany(() => User, (user) => user.building)
  users: User[];

  @OneToMany(() => ParkingSlot, (slot) => slot.building)
  slots: Relation<ParkingSlot[]>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;
}
