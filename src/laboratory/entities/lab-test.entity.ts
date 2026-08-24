import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('lab_tests')
export class LabTest extends BaseEntity {
  @Column()
  patientId: number;

  @Column()
  doctorId: number;

  @Column()
  testName: string;

  @Column()
  testType: string;

  @Column({ default: 'pending' }) // pending, completed, cancelled
  status: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  testDate: Date;

  @Column({ type: 'text', nullable: true })
  reportUrl: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
