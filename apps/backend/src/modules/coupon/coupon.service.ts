import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { Coupon } from './coupon.entity';
@Injectable()
export class CouponService {
  repo() { return AppDataSource.getRepository(Coupon); }
  list() { return this.repo().find(); }
  find(code: string) { return this.repo().findOne({ where: { code: code.toUpperCase() } }); }
  async validate(code: string, amount: number) {
    const c = await this.find(code); if (!c || !c.active) return { valid: false, error: 'Invalid code' };
    if (amount < c.minAmount) return { valid: false, error: `Min Rs. ${c.minAmount}` };
    return { valid: true, coupon: c };
  }
}
