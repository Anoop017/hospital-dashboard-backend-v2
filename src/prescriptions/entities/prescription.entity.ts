import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('prescriptions')
export class Prescription extends BaseEntity {
  @Column()
  patientId: number;

  @Column()
  doctorId: number;

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
}
