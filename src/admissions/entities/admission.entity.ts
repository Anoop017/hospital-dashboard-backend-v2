import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Bed } from '../../beds/entities/bed.entity';
import { AdmissionStatus } from '../../common/enums/admission-status.enum';

@Entity('admissions')
export class Admission extends BaseEntity {
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @ManyToOne(() => Doctor, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'admittingDoctorId' })
  admittingDoctor: Doctor;

  @Column({ nullable: true })
  admittingDoctorId: number;

  @OneToOne(() => Bed)
  @JoinColumn({ name: 'bedId' })
  bed: Bed;

  @Column({ nullable: true })
  bedId: number;

  @Column({ type: 'timestamp' })
  admissionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dischargeDate: Date;

  @Column({ type: 'enum', enum: AdmissionStatus, default: AdmissionStatus.ADMITTED })
  status: AdmissionStatus;

  @Column({ type: 'text' })
  reason: string;
}
