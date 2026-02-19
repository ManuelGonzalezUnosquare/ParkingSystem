import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Raffle } from './raffle.entity';
import { User } from './user.entity';
import { ParkingSlot } from './parking-slot.entity';
import { BaseEntity } from './_base.entity';
import { Vehicle } from './vehicle.entity';
import { UserRaffleResultEnum } from '@parking-system/libs';

@Entity('raffle_results')
export class RaffleResult extends BaseEntity {
  @ManyToOne(() => Raffle, (raffle) => raffle.results)
  @JoinColumn({ name: 'raffle_id' })
  raffle: Raffle;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vehicle, { nullable: true }) // Null if user doesn't has vehicle
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSlot, { nullable: true }) // Null if wasnt selected on raffle
  @JoinColumn({ name: 'slot_id' })
  slot: ParkingSlot;

  @Column({ type: 'int' })
  scoreAtDraw: number;

  @Column({
    type: 'enum',
    enum: UserRaffleResultEnum,
    default: UserRaffleResultEnum.LOSER,
  })
  status: string;
}
