import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Bed } from '../../beds/entities/bed.entity';

@Entity('admissions')
export class Admission extends BaseEntity {
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Doctor, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'admittingDoctorId' })
  admittingDoctor: Doctor;

  @Column({ nullable: true })
  admittingDoctorId: string;

  @OneToOne(() => Bed)
  @JoinColumn({ name: 'bedId' })
  bed: Bed;

  @Column({ nullable: true }) // nullable because they might be discharged
  bedId: string;

  @Column({ type: 'timestamp' })
  admissionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dischargeDate: Date;

  @Column({ default: 'admitted' }) // admitted, discharged, transferred
  status: string;

  @Column({ type: 'text' })
  reason: string;
}
