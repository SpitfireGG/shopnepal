import { Injectable } from '@nestjs/common';
import { ProductService } from '../../modules/product/product.service';
@Injectable()
export class OrderPaidListener {
  constructor(private products: ProductService) {}
  async handle(order: any) {
    await this.products.decrementStock((order.lines || []).map(l => ({ productId: l.productId, qty: l.qty })));
  }
}
