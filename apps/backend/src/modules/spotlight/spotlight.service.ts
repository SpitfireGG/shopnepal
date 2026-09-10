import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { Product } from '../product/product.entity';
import * as crypto from 'crypto';

@Injectable()
export class SpotlightService {
  // Visual Search — mock CLIP: hash image name, return 4 nearest by category embedding
  async visualSearch(imageName: string, categoryHint?: string) {
    const repo = AppDataSource.getRepository(Product);
    let all = await repo.find();
    if (categoryHint) {
      const hint = categoryHint.toLowerCase();
      const filtered = all.filter(p => p.category.toLowerCase().includes(hint) || p.title.toLowerCase().includes(hint));
      if (filtered.length >= 2) all = filtered;
    }
    // mock similarity: deterministic shuffle by hash
    const hash = crypto.createHash('md5').update(imageName || 'default').digest('hex');
    const seed = parseInt(hash.slice(0, 8), 16);
    const scored = all.map((p, i) => ({
      product: p,
      score: 0.92 - (Math.abs((seed + i * 997) % 1000) / 5000) - (i * 0.01),
    })).sort((a, b) => b.score - a.score).slice(0, 4);
    return scored;
  }

  // AI Stylist — outfit graph: pick anchor product, build 3-item bundle
  async stylistBundle(anchorId?: string, style: string = 'casual') {
    const repo = AppDataSource.getRepository(Product);
    const all = await repo.find();
    const anchor = anchorId ? await repo.findOne({ where: { id: anchorId } }) : all[0];
    if (!anchor) return { bundle: [], total: 0 };
    const styleMap: Record<string, string[]> = {
      casual: ['jacket', 't-shirt', 'shoes', 'jeans'],
      formal: ['shirt', 'blazer', 'shoes', 'watch'],
      festive: ['kurta', 'jewellery', 'shoes', 'handbag'],
    };
    const cats = styleMap[style] || styleMap.casual;
    const bundle = [anchor];
    for (const cat of cats) {
      if (bundle.length >= 4) break;
      const pick = all.find(p => p.category.toLowerCase().includes(cat) && !bundle.find(b => b.id === p.id));
      if (pick) bundle.push(pick);
    }
    while (bundle.length < 3 && all.length > bundle.length) bundle.push(all[bundle.length % all.length]);
    const total = bundle.reduce((s, p) => s + p.price, 0);
    const discount = Math.floor(total * 0.1);
    return { bundle, total, discount, finalTotal: total - discount, style };
  }

  // Provenance — mock IPFS + on-chain hash
  async provenance(productId: string) {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({ where: { id: productId } });
    if (!product) return null;
    const payload = `${product.id}:${product.title}:${product.category}:${Date.now()}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    const ipfsCid = `bafybeig${hash.slice(0, 40)}`;
    const txHash = `0x${hash.slice(0, 64)}`;
    return {
      productId: product.id,
      productTitle: product.title,
      origin: 'Handwoven in Bhaktapur, Bagmati Province, Nepal',
      artisan: 'ShopNepal Certified Artisan #NP-2047',
      ipfsCid: ipfsCid,
      txHash: txHash,
      blockNumber: 4827193 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      qrData: `https://shopnepal.com.np/provenance/${product.id}?tx=${txHash}`,
    };
  }

  // Voice — mock Nepali intent parsing
  async voiceIntent(transcript: string) {
    const t = transcript.toLowerCase();
    let intent = 'search';
    let query = transcript;
    let category: string | null = null;
    if (t.includes('ज्याकेट') || t.includes('jacket')) category = 'jacket';
    else if (t.includes('जुत्ता') || t.includes('shoes')) category = 'shoes';
    else if (t.includes('घडी') || t.includes('watch')) category = 'watch';
    else if (t.includes('गहना') || t.includes('jewellery')) category = 'jewellery';
    if (category) query = category;
    if (t.includes('कार्ट') || t.includes('bag')) intent = 'cart';
    if (t.includes('अर्डर') || t.includes('track')) intent = 'track';
    const repo = AppDataSource.getRepository(Product);
    const results = await repo.createQueryBuilder('p')
      .where('LOWER(p.title) LIKE :q OR LOWER(p.category) LIKE :q', { q: `%${query.toLowerCase().trim().slice(0,30)}%` })
      .take(4).getMany();
    return { transcript, intent, query, category, results, reply: category ? `मैले ${category} भेटें — ${results.length} उत्पादनहरू` : `मैले "${query}" को लागि ${results.length} उत्पादन भेटें` };
  }

  // Live Map — mock courier location
  getCourierLocation(orderId: string) {
    const hash = parseInt(crypto.createHash('md5').update(orderId).digest('hex').slice(0, 6), 16);
    const lat = 27.67 + (hash % 1000) / 10000; // around Pulchowk, Lalitpur
    const lng = 85.32 + (hash % 1000) / 10000;
    const eta = 12 + (hash % 20);
    return { orderId, courier: 'Ram Bahadur • NPL-071', phone: '+977-9800000711', lat, lng, etaMinutes: eta, status: eta < 15 ? 'out_for_delivery' : 'dispatched' };
  }

  // BNPL — calculate installments
  bnpl(amount: number, months: number = 3) {
    const rates: Record<number, number> = { 3: 0, 6: 0.02, 12: 0.05 };
    const rate = rates[months] ?? 0.05;
    const total = Math.round(amount * (1 + rate));
    const monthly = Math.round(total / months);
    return { amount, months, rate, total, monthly, provider: months <= 3 ? 'eSewa 0% EMI' : 'Khalti BNPL' };
  }
}
