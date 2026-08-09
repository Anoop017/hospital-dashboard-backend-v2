import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from './patient.entity';

@Entity('patient_conditions')
export class PatientCondition extends BaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  conditionName: string;

  @Column({ type: 'date', nullable: true })
  diagnosedDate: Date;

  @Column({ nullable: true })
  status: string; // active, resolved, managing
}
