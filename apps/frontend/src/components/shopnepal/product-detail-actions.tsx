'use client';
import { useState } from 'react';
export function AddToBag({ product, size }: { product: any; size?: string | null }) {
  const [added, setAdded] = useState(false);
  const add = () => {
    try {
      const selSize = size ?? product.sizes?.[0] ?? null;
      const c: any[] = JSON.parse(localStorage.getItem('shopnepal.cart.v1') || '[]');
      const idx = c.findIndex((x: any) => x.id === product.id && x.size === selSize);
      if (idx >= 0) c[idx].qty += 1; else c.push({ id: product.id, qty: 1, size: selSize });
      localStorage.setItem('shopnepal.cart.v1', JSON.stringify(c));
      window.dispatchEvent(new Event('shopnepal:cart-changed'));
      setAdded(true); setTimeout(() => setAdded(false), 1500);
    } catch {}
  };
  return (
    <button className="banner-btn" style={{ padding: '12px 28px', fontSize: 14, background: added ? 'hsl(152,51%,52%)' : undefined }} onClick={add}>
      {added ? '✓ Added to Bag' : 'Add to Bag'}
    </button>
  );
}
export function BuyNow({ product, size }: { product: any; size?: string | null }) {
  const [loading, setLoading] = useState(false);
  const buy = () => {
    try {
      const selSize = size ?? product.sizes?.[0] ?? null;
      const c: any[] = JSON.parse(localStorage.getItem('shopnepal.cart.v1') || '[]');
      const idx = c.findIndex((x: any) => x.id === product.id && x.size === selSize);
      if (idx >= 0) c[idx].qty += 1; else c.push({ id: product.id, qty: 1, size: selSize });
      localStorage.setItem('shopnepal.cart.v1', JSON.stringify(c));
      window.dispatchEvent(new Event('shopnepal:cart-changed'));
      setLoading(true);
      window.location.href = '/cart';
    } catch {}
  };
  return (
    <button className="banner-btn" style={{ padding: '12px 28px', fontSize: 14, background: 'hsl(0,0%,13%)', color: '#fff', border: '1px solid hsl(0,0%,13%)' }} onClick={buy} disabled={loading}>
      {loading ? 'Going to Bag...' : 'Buy Now'}
    </button>
  );
}
export function ProductDetailActions({ product }: { product: any }) {
  const [selSize, setSelSize] = useState<string | null>(product.sizes?.[0] ?? null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {product.sizes && product.sizes.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'hsl(0,0%,47%)' }}>Size:</span>
          {product.sizes.map((s: string) => (
            <button key={s} onClick={() => setSelSize(s)} style={{ padding: '6px 14px', border: '1px solid', borderColor: selSize === s ? 'hsl(0,0%,13%)' : 'hsl(0,0%,93%)', borderRadius: 6, background: selSize === s ? 'hsl(0,0%,13%)' : '#fff', color: selSize === s ? '#fff' : '#000', fontSize: 12, fontWeight: 500 }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <AddToBag product={product} size={selSize} />
        <BuyNow product={product} size={selSize} />
      </div>
    </div>
  );
}
