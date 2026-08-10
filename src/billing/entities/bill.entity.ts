import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Admission } from '../../admissions/entities/admission.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Payment } from './payment.entity';

@Entity('bills')
export class Bill extends BaseEntity {
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Admission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admissionId' })
  admission: Admission;

  @Column({ nullable: true })
  admissionId: string;

  @ManyToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ default: 'unpaid' }) // unpaid, partially_paid, paid
  status: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @OneToMany(() => Payment, (payment) => payment.bill, { cascade: true })
  payments: Payment[];
}
