import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('coupons')
export class Coupon {
  @PrimaryColumn() code: string;
  @Column() type: string;
  @Column() value: number;
  @Column({ default: 0 }) minAmount: number;
  @Column({ default: true }) active: boolean;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date;
  @CreateDateColumn() createdAt: Date;
}
