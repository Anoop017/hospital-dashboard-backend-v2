import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from './patient.entity';

@Entity('emergency_contacts')
export class EmergencyContact extends BaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.emergencyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  name: string;

  @Column()
  relationship: string;

  @Column()
  phone: string;
}
