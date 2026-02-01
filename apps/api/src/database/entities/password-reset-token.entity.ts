import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./_base.entity";
import { User } from "./user.entity";

@Entity("password_reset_tokens")
export class PasswordResetToken extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  token: string;

  @Column({ type: "datetime" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  isUsed: boolean;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
