import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Bill } from './bill.entity';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Bill, (bill) => bill.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @Column()
  billId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column()
  paymentMethod: string; // cash, credit_card, insurance, transfer

  @Column({ nullable: true })
  referenceNumber: string;
}
