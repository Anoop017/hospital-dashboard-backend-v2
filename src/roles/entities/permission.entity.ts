import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  name: string; // e.g., 'CREATE_PATIENT'

  @Column()
  resource: string; // e.g., 'PATIENT'

  @Column()
  action: string; // e.g., 'CREATE', 'READ', 'UPDATE', 'DELETE'

  @Column({ nullable: true })
  description: string;
}
