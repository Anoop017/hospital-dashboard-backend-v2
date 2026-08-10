import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'active' }) // active, inactive
  status: string;

  @OneToMany(() => Staff, (staff) => staff.department)
  staff: Staff[];
}
