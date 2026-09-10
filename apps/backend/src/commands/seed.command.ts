import { AppDataSource } from '../core/database/data-source';
import { Product } from '../modules/product/product.entity';
import { Coupon } from '../modules/coupon/coupon.entity';
export async function seedCommand() {
  const pr = AppDataSource.getRepository(Product);
  const cr = AppDataSource.getRepository(Coupon);
  if ((await pr.count()) === 0) {
    let products: any[] = [];
    try { products = require('../../../assets/js/products.js').PRODUCTS; } catch {}
    if (!products.length) {
      try { products = require('/app/assets/js/products.js').PRODUCTS; } catch {}
    }
    if (products.length) {
      for (const p of products) await pr.save(pr.create({ ...p, images: p.images, sizes: p.sizes, reorderLevel: 5 }));
      console.log('seeded', products.length, 'products');
    } else {
      console.log('seed skipped - no products file, DB already seeded');
    }
  }
  if ((await cr.count()) === 0) {
    await cr.save(cr.create({ code: 'WELCOME10', type: 'percent', value: 10, minAmount: 1000, active: true } as any));
    await cr.save(cr.create({ code: 'FLAT500', type: 'flat', value: 500, minAmount: 5000, active: true } as any));
    console.log('seeded coupons');
  }
}
