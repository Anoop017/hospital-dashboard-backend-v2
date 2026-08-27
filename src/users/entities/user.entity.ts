import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  mobile: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
