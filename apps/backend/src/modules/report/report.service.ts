import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { Order } from '../order/order.entity';
@Injectable()
export class ReportService {
  async sales(from?: string, to?: string) {
    const qb = AppDataSource.getRepository(Order).createQueryBuilder('o').where("o.paymentStatus='PAID'");
    if (from) qb.andWhere('o.createdAt >= :from', { from });
    if (to) qb.andWhere('o.createdAt <= :to', { to });
    const orders = await qb.getMany();
    const byPayment = {}; const byCategory = {}; const byDay = {}; let revenue = 0;
    for (const o of orders) {
      revenue += Number(o.totalAmount || 0);
      byPayment[o.method] = (byPayment[o.method] || 0) + Number(o.totalAmount);
      for (const l of o.lines || []) { byCategory[l.slug] = (byCategory[l.slug] || 0) + l.lineTotal; }
      const day = (o.createdAt as any).toISOString?.().slice(0, 10) || String(o.createdAt).slice(0, 10);
      byDay[day] = (byDay[day] || 0) + Number(o.totalAmount);
    }
    return { totalOrders: orders.length, revenue, byPayment, byCategory, byDay, orders };
  }
  csv(rows: any[]) {
    const header = 'date,orderNumber,method,amount,status';
    const lines = rows.map(o => `${String(o.createdAt).slice(0, 10)},${o.orderNumber},${o.method},${o.totalAmount},${o.paymentStatus}`);
    return [header, ...lines].join('\n');
  }
}
