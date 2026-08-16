import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('lab_tests')
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
