import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn() id: number;
  @Column() actor: string;
  @Column() action: string;
  @Column() entity: string;
  @Column() entityId: string;
  @Column('jsonb', { nullable: true }) meta: any;
  @CreateDateColumn() createdAt: Date;
}
