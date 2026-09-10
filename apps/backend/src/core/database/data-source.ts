import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../../modules/product/product.entity';
import { Order } from '../../modules/order/order.entity';
import { OrderLine } from '../../modules/order/order-line.entity';
import { AuditLog } from '../../modules/audit/audit.entity';
import { Coupon } from '../../modules/coupon/coupon.entity';
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://shopnepal:shopnepal123@localhost:5432/shopnepal',
  entities: [Product, Order, OrderLine, AuditLog, Coupon],
  synchronize: true,
  logging: false,
});
