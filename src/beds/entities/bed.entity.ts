import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Ward } from '../../wards/entities/ward.entity';

@Entity('beds')
export class Bed extends BaseEntity {
  @ManyToOne(() => Ward, (ward) => ward.beds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wardId' })
  ward: Ward;

  @Column()
  wardId: string;

  @Column()
  bedNumber: string; // e.g., Bed-01, ICU-04

  @Column({ default: 'available' }) // available, occupied, maintenance
  status: string;
}
