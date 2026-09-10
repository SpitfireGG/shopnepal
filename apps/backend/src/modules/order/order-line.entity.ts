import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
@Entity('order_lines')
export class OrderLine {
  @PrimaryGeneratedColumn() id: number;
  @Column() orderUuid: string;
  @ManyToOne(() => Order, o => o.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderUuid', referencedColumnName: 'transactionUuid' })
  order: Order;
  @Column() productId: string;
  @Column() slug: string;
  @Column() title: string;
  @Column({ nullable: true }) size: string;
  @Column() qty: number;
  @Column() unitPrice: number;
  @Column() lineTotal: number;
}
