import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderLine } from './order-line.entity';
@Entity('orders')
export class Order {
  @PrimaryColumn() transactionUuid: string;
  @Column({ unique: true }) orderNumber: number;
  @Column() method: string;
  @Column() paymentStatus: string;
  @Column() status: string;
  @Column({ nullable: true }) paymentRef: string;
  @Column({ nullable: true }) pidx: string;
  @Column({ nullable: true }) gatewayStatus: string;
  @Column({ type: 'timestamp', nullable: true }) paidAt: Date;
  @Column('jsonb') customer: any;
  @Column({ nullable: true }) customerIp: string;
  @Column() subtotal: number;
  @Column() deliveryCharge: number;
  @Column() totalAmount: number;
  @Column({ nullable: true }) couponCode: string;
  @Column({ default: 0 }) discountAmount: number;
  @OneToMany(() => OrderLine, l => l.order, { cascade: true, eager: true })
  lines: OrderLine[];
  @CreateDateColumn() createdAt: Date;
  @Column({ type: 'timestamp', nullable: true }) updatedAt: Date;
}
