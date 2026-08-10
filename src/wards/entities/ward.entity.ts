import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Bed } from '../../beds/entities/bed.entity';

@Entity('wards')
export class Ward extends BaseEntity {
  @Column({ unique: true })
  name: string; // e.g., General Ward A, ICU 1

  @Column()
  type: string; // general, icu, maternity, pediatric

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy: number;

  @Column()
  floor: string;

  @Column({ default: 'active' }) // active, maintenance, closed
  status: string;

  @OneToMany(() => Bed, (bed) => bed.ward, { cascade: true })
  beds: Bed[];
}
