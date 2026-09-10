import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { Product } from './product.entity';
@Injectable()
export class ProductService {
  repo() { return AppDataSource.getRepository(Product); }
  list() { return this.repo().find({ order: { createdAt: 'DESC' } }); }
  bySlug(slug: string) { return this.repo().findOne({ where: { slug } }); }
  byId(id: string) { return this.repo().findOne({ where: { id } }); }
  search(q: string, category?: string) {
    const qb = this.repo().createQueryBuilder('p');
    if (q) qb.where('LOWER(p.title) LIKE :q OR LOWER(p.category) LIKE :q', { q: `%${q.toLowerCase()}%` });
    if (category) qb.andWhere('p.category=:c', { c: category });
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }
  async create(dto: any) {
    const slug = this.slugify(dto.slug || dto.title);
    const id = dto.id || `SHOPNEPAL-${Date.now().toString(36).toUpperCase()}`;
    const p = this.repo().create({ id, slug: await this.uniqueSlug(slug), title: dto.title, category: (dto.category || 'general').toLowerCase(), badge: dto.badge || null, rating: dto.rating || 4, price: dto.price, compareAt: dto.compareAt || null, images: dto.images || ['/assets/images/products/1.jpg'], sizes: dto.sizes || null, stock: dto.stock || 0, description: dto.description || '', reorderLevel: dto.reorderLevel || 5 });
    return this.repo().save(p);
  }
  async update(id: string, dto: any) {
    const p = await this.byId(id); if (!p) return null;
    if (dto.title) p.title = dto.title;
    if (dto.category) p.category = dto.category.toLowerCase();
    if (dto.price !== undefined) p.price = dto.price;
    if (dto.stock !== undefined) p.stock = dto.stock;
    if (dto.slug) p.slug = await this.uniqueSlug(this.slugify(dto.slug), id);
    Object.assign(p, dto);
    return this.repo().save(p);
  }
  remove(id: string) { return this.repo().delete(id); }
  async decrementStock(lines: { productId: string; qty: number }[]) {
    for (const l of lines) { const p = await this.byId(l.productId); if (p) { p.stock = Math.max(0, p.stock - l.qty); await this.repo().save(p); } }
  }
  lowStock() { return this.repo().createQueryBuilder('p').where('p.stock <= p.reorderLevel').getMany(); }
  private slugify(s: string) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || `product-${Date.now()}`; }
  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = base, n = 1;
    while (await this.repo().findOne({ where: { slug } }).then(r => r && r.id !== excludeId)) { slug = `${base}-${n++}`; }
    return slug;
  }
}
