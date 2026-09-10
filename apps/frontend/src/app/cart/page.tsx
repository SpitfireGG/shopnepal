// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';

export default function CartPage(){
  const [items,setItems]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  useEffect(()=>{
    const raw=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]');
    setItems(raw);
    fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000') + '/api/products').then(r=>r.json()).then(setProducts).catch(()=>{});
  },[]);
  const detailed=items.map((l:any)=>{
    const p=products.find((pp:any)=>pp.id===l.id);
    return p ? { ...l, product:p, lineTotal: p.price*l.qty } : null;
  }).filter(Boolean);
  const subtotal=detailed.reduce((s:any,l:any)=>s+l.lineTotal,0);
  const delivery=100;
  const total=subtotal+delivery;
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <h1 className="title">Your bag ({detailed.length})</h1>
        {detailed.length===0 ? <p style={{padding:40, textAlign:'center', color:'hsl(0,0%,47%)'}}>Your bag is empty. <a href="/" style={{color:'hsl(353,100%,78%)'}}>Continue shopping</a></p> : (
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:10, overflow:'hidden'}}>
              <table className="doc-table" style={{width:'100%'}}>
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                <tbody>
                  {detailed.map((l:any,i:number)=>(
                    <tr key={i}><td>{l.product.title} {l.size?`(${l.size})`:''}</td><td>{l.qty}</td><td>Rs. {l.lineTotal.toLocaleString('en-IN')}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:10, padding:18}}>
              <h3 style={{fontWeight:600, marginBottom:12}}>Order summary</h3>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid hsl(0,0%,93%)'}}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString('en-IN')}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid hsl(0,0%,93%)'}}><span>Delivery</span><span>Rs. {delivery.toLocaleString('en-IN')}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', fontWeight:700}}><span>Total</span><span>Rs. {total.toLocaleString('en-IN')}</span></div>
              <button className="banner-btn" style={{width:'100%', marginTop:12, padding:'12px'}}>Proceed to Checkout</button>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:8, textAlign:'center'}}>eSewa • Khalti • Cash on Delivery • Nepal</p>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
