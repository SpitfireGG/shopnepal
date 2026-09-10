import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('products')
export class Product {
  @PrimaryColumn() id: string;
  @Column({ unique: true }) slug: string;
  @Column() title: string;
  @Column() category: string;
  @Column({ nullable: true }) badge: string;
  @Column() rating: number;
  @Column() price: number;
  @Column({ nullable: true }) compareAt: number;
  @Column('simple-array') images: string[];
  @Column('simple-array', { nullable: true }) sizes: string[] | null;
  @Column() stock: number;
  @Column('text') description: string;
  @Column({ default: 5 }) reorderLevel: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
