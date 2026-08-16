import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column({ type: 'text' })
  medication: string;

  @Column({ type: 'text' })
  dosage: string;

  @Column({ type: 'text' })
  frequency: string;

  @Column({ type: 'text' })
  duration: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedDate: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
