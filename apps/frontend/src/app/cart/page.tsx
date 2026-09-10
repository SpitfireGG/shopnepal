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
  const [months,setMonths]=useState(3);
  const [bnpl,setBnpl]=useState<any>(null);
  useEffect(()=>{
    if(subtotal>0) fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000')+'/api/spotlight/bnpl/calc', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: subtotal+delivery, months })}).then(r=>r.json()).then(setBnpl).catch(()=>{});
  },[subtotal, months]);
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
              <div style={{marginTop:12, padding:12, border:'1px solid hsl(152,51%,52%)', borderRadius:8, background:'hsla(152,51%,52%,.08)'}}>
                <p style={{fontSize:12, fontWeight:600}}>BNPL • {bnpl?.provider || 'eSewa EMI'}</p>
                <div style={{display:'flex', gap:6, marginTop:8}}>
                  {[3,6,12].map(m=>(
                    <button key={m} onClick={()=>setMonths(m)} style={{flex:1, padding:'8px', border:'1px solid', borderColor: months===m ? 'hsl(152,51%,52%)' : 'hsl(0,0%,93%)', borderRadius:6, background: months===m ? 'hsl(152,51%,52%)' : '#fff', color: months===m ? '#fff' : '#000', fontSize:12}}>
                      {m} mo
                    </button>
                  ))}
                </div>
                {bnpl && <p style={{fontSize:12, marginTop:8, color:'hsl(0,0%,47%)'}}>Rs. {bnpl.monthly.toLocaleString('en-IN')} × {bnpl.months} = Rs. {bnpl.total.toLocaleString('en-IN')} {bnpl.rate>0?`(+${bnpl.rate*100}%)`:'(0% interest)'}</p>}
              </div>
              <button className="banner-btn" style={{width:'100%', marginTop:12, padding:'12px'}}>Proceed to Checkout</button>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:8, textAlign:'center'}}>eSewa • Khalti • BNPL • Nepal</p>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
