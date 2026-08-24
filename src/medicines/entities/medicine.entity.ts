import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('medicines')
export class Medicine extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  manufacturer: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: string;
}
