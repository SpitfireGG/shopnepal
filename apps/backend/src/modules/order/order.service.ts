import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { Order } from './order.entity';
import { OrderLine } from './order-line.entity';
import { ProductService } from '../product/product.service';
import * as crypto from 'crypto';
@Injectable()
export class OrderService {
  constructor(private products: ProductService) {}
  repo() { return AppDataSource.getRepository(Order); }
  list() { return this.repo().find({ order: { createdAt: 'DESC' } }); }
  get(uuid: string) { return this.repo().findOne({ where: { transactionUuid: uuid } }); }
  async create(dto: any) {
    const max = (await this.repo().createQueryBuilder('o').select('MAX(o.orderNumber)', 'max').getRawOne()).max || 1000;
    const order = this.repo().create({ ...dto, orderNumber: max + 1, paymentStatus: 'PENDING', status: 'PENDING' });
    const savedArr = await this.repo().save(order as any);
    const saved: any = Array.isArray(savedArr) ? savedArr[0] : savedArr;
    for (const l of dto.lines) {
      const line = AppDataSource.getRepository(OrderLine).create({ orderUuid: saved.transactionUuid, productId: l.id, slug: l.slug, title: l.title, size: l.size, qty: l.qty, unitPrice: l.unitPrice, lineTotal: l.lineTotal } as any);
      await AppDataSource.getRepository(OrderLine).save(line as any);
    }
    return this.get(saved.transactionUuid);
  }
  async updateStatus(uuid: string, status: string) { const o = await this.get(uuid); if (!o) return null; o.status = status; (o as any).updatedAt = new Date(); return this.repo().save(o); }
  async markPaid(uuid: string, meta: any) {
    const o = await this.get(uuid); if (!o) return null;
    o.paymentStatus = 'PAID'; o.status = 'PROCESSING'; o.paymentRef = meta.paymentRef || null; o.gatewayStatus = meta.gatewayStatus || null; o.paidAt = new Date();
    const saved = await this.repo().save(o);
    await this.products.decrementStock((o.lines || []).map(l => ({ productId: l.productId, qty: l.qty })));
    return saved;
  }
  newUuid() { const stamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); return `SHOPNEPAL-${stamp}-${crypto.randomBytes(3).toString('hex')}`; }
  async tracking(uuid: string) { const o = await this.get(uuid); if (!o) return null; const steps = ['PENDING', 'PROCESSING', 'COMPLETED']; const idx = steps.indexOf(o.status); return { order: o, steps: steps.map((s) => ({ status: s, done: idx >= steps.indexOf(s), current: s === o.status })) }; }
}
