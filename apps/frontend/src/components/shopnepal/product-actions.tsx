'use client';
import { IonIcon } from './ion-icon';
import Link from 'next/link';
import { useState, useEffect } from 'react';
export function ProductActions({ product }: { product: any }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    try { const w: string[] = JSON.parse(localStorage.getItem('shopnepal.wishlist') || '[]'); setWishlisted(w.includes(product.id)); } catch {}
  }, [product.id]);
  const toggleWishlist = () => {
    try {
      const w: string[] = JSON.parse(localStorage.getItem('shopnepal.wishlist') || '[]');
      const n = w.includes(product.id) ? w.filter((x: string) => x !== product.id) : [...w, product.id];
      localStorage.setItem('shopnepal.wishlist', JSON.stringify(n));
      setWishlisted(!wishlisted);
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };
  const addToCart = () => {
    try {
      const c: any[] = JSON.parse(localStorage.getItem('shopnepal.cart.v1') || '[]');
      const idx = c.findIndex((x: any) => x.id === product.id);
      if (idx >= 0) c[idx].qty += 1; else c.push({ id: product.id, qty: 1, size: product.sizes?.[0] || null });
      localStorage.setItem('shopnepal.cart.v1', JSON.stringify(c));
      window.dispatchEvent(new Event('shopnepal:cart-changed'));
      setAdded(true); setTimeout(() => setAdded(false), 1200);
    } catch {}
  };
  return (
    <div className="showcase-actions">
      <button className="btn-action" onClick={toggleWishlist} style={{ color: wishlisted ? 'hsl(353,100%,78%)' : undefined }} aria-label="wishlist">
        <IonIcon name={wishlisted ? 'heart' : 'heart-outline'} />
      </button>
      <Link href={`/product/${product.slug}`} className="btn-action" aria-label="view">
        <IonIcon name="eye-outline" />
      </Link>
      <button className="btn-action" onClick={addToCart} aria-label="add to cart" style={{ background: added ? 'hsl(152,51%,52%)' : undefined, color: added ? '#fff' : undefined }}>
        <IonIcon name={added ? 'checkmark-outline' : 'bag-add-outline'} />
      </button>
    </div>
  );
}
export function StarRating({ rating = 4 }: { rating?: number }) {
  return <div className="showcase-rating">{Array.from({ length: 5 }).map((_, i) => <IonIcon key={i} name={i < rating ? 'star' : 'star-outline'} />)}</div>;
}
