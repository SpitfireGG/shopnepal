// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WishlistPage(){
  const [ids,setIds]=useState<string[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  useEffect(()=>{
    setIds(JSON.parse(localStorage.getItem('shopnepal.wishlist')||'[]'));
    try{ const p=JSON.parse(localStorage.getItem('shopnepal.wishlist')||'[]'); setIds(p); }catch{}
    fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000')+'/api/products').then(r=>r.json()).then(setProducts).catch(()=>{});
    const onStorage=()=> setIds(JSON.parse(localStorage.getItem('shopnepal.wishlist')||'[]'));
    window.addEventListener('storage', onStorage);
    return ()=> window.removeEventListener('storage', onStorage);
  },[]);
  const list=ids.map(id=> products.find((p:any)=>p.id===id)).filter(Boolean);
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1200, margin:'0 auto'}}>
        <h1 className="title">Your wishlist</h1>
        {list.length===0 ? <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>Your wishlist is empty. Tap the heart on any product to save it.</p> : (
          <div className="product-grid">
            {list.map((p:any)=>(
              <div key={p.id} className="showcase">
                <div className="showcase-banner">
                  <img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/>
                  <div className="showcase-actions">
                    <button className="btn-action" style={{color:'hsl(353,100%,78%)'}} onClick={()=>{
                      const w=JSON.parse(localStorage.getItem('shopnepal.wishlist')||'[]'); const n=w.filter((x:string)=>x!==p.id); localStorage.setItem('shopnepal.wishlist', JSON.stringify(n)); setIds(n);
                    }}><ion-icon name="heart"></ion-icon></button>
                    <Link href={`/product/${p.slug}`} className="btn-action"><ion-icon name="eye-outline"></ion-icon></Link>
                  </div>
                </div>
                <div className="showcase-content">
                  <Link href={`/product/${p.slug}`} className="showcase-category">{p.category}</Link>
                  <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                  <div className="price-box"><p className="price">Rs. {Number(p.price).toLocaleString('en-IN')}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
