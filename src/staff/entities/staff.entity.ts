import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('staff')
export class Staff extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Department, (department) => department.staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: number;

  @Column()
  jobTitle: string; // e.g., Nurse, Receptionist, Cleaner

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ default: 'active' }) // active, on_leave, terminated
  status: string;
}
