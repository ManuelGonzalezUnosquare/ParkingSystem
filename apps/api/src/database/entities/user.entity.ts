import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import { BaseEntity } from './_base.entity';
import { Building } from './building.entity';
import { Role } from './role.entity';
import { Vehicle } from './vehicle.entity';
import { Exclude } from 'class-transformer';
import { UserStatusEnum } from '@parking-system/libs';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 50, default: null })
  passwordResetCode: string;

  @Column({ default: true })
  requirePasswordChange: boolean;

  @Column({ type: 'int', default: 0 })
  priorityScore: number;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.ACTIVE,
  })
  status: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Building, (building) => building.users, { nullable: true })
  @JoinColumn({ name: 'building_id' })
  building: Building; // NULL if ROOT

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Relation<Vehicle>[];
}
