import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from './patient.entity';

@Entity('patient_allergies')
export class PatientAllergy extends BaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.allergies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @Column()
  allergen: string;

  @Column({ nullable: true })
  severity: string;

  @Column({ nullable: true })
  reaction: string;
}
