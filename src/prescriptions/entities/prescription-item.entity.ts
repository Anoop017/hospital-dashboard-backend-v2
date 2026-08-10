import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prescriptionId: string;

  @Column()
  medicineId: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column()
  duration: string;

  @ManyToOne(() => Prescription, prescription => prescription.items)
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
