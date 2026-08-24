import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { EmergencyContact } from './emergency-contact.entity';
import { PatientAllergy } from './patient-allergy.entity';
import { PatientCondition } from './patient-condition.entity';
import { Gender } from '../../common/enums/gender.enum';
import { BloodGroup } from '../../common/enums/blood-group.enum';

@Entity('patients')
export class Patient extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: BloodGroup, nullable: true })
  bloodGroup: BloodGroup;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  medicalNotes: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => EmergencyContact, (contact) => contact.patient, { cascade: true })
  emergencyContacts: EmergencyContact[];

  @OneToMany(() => PatientAllergy, (allergy) => allergy.patient, { cascade: true })
  allergies: PatientAllergy[];

  @OneToMany(() => PatientCondition, (condition) => condition.patient, { cascade: true })
  conditions: PatientCondition[];
}
