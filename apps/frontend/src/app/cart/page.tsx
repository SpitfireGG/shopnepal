// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';

export default function CartPage(){
  const [items,setItems]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [selected,setSelected]=useState<Set<string>>(new Set());
  useEffect(()=>{
    const raw=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]');
    setItems(raw);
    const keys=new Set(raw.map((l:any)=>`${l.id}::${l.size||''}`));
    setSelected(keys);
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${base}/api/products`).then(r=>r.json()).then(setProducts).catch(()=>{});
  },[]);
  const persist=(next:any[])=>{
    setItems(next);
    localStorage.setItem('shopnepal.cart.v1', JSON.stringify(next));
    window.dispatchEvent(new Event('shopnepal:cart-changed'));
  };
  const removeItem=(key:string)=>{
    const next=items.filter((l:any)=> `${l.id}::${l.size||''}`!==key);
    const ns=new Set(selected); ns.delete(key); setSelected(ns); persist(next);
  };
  const updateQty=(key:string, delta:number)=>{
    const next=items.map((l:any)=> {
      if(`${l.id}::${l.size||''}`===key){
        const q=Math.max(1, (l.qty||1)+delta);
        return {...l, qty:q};
      }
      return l;
    });
    persist(next);
  };
  const toggle=(key:string)=>{
    const ns=new Set(selected);
    if(ns.has(key)) ns.delete(key); else ns.add(key);
    setSelected(ns);
  };
  const toggleAll=()=>{
    if(selected.size===items.length) setSelected(new Set());
    else setSelected(new Set(items.map((l:any)=>`${l.id}::${l.size||''}`)));
  };
  const detailed=items.map((l:any)=>{
    const p=products.find((pp:any)=>pp.id===l.id);
    return p ? { ...l, product:p, lineTotal: p.price*l.qty, key:`${l.id}::${l.size||''}` } : null;
  }).filter(Boolean);
  const selectedDetailed=detailed.filter((l:any)=> selected.has(l.key));
  const subtotal=selectedDetailed.reduce((s:any,l:any)=>s+l.lineTotal,0);
  const delivery=selectedDetailed.length?100:0;
  const total=subtotal+delivery;
  const allSelected=items.length>0 && selected.size===items.length;
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <h1 className="title">Your bag ({detailed.length})</h1>
        {detailed.length===0 ? <p style={{padding:40, textAlign:'center', color:'hsl(0,0%,47%)'}}>Your bag is empty. <a href="/" style={{color:'hsl(353,100%,78%)'}}>Continue shopping</a></p> : (
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:10, overflow:'hidden'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderBottom:'1px solid hsl(0,0%,93%)', background:'hsl(0,0%,98%)'}}>
                <label style={{display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer'}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/> Select all ({selected.size}/{detailed.length})</label>
                <span style={{fontSize:12, color:'hsl(0,0%,47%)'}}>Uncheck to exclude from checkout</span>
              </div>
              <table className="doc-table" style={{width:'100%'}}>
                <thead><tr><th style={{width:36}}></th><th>Item</th><th>Qty</th><th>Price</th><th></th></tr></thead>
                <tbody>
                  {detailed.map((l:any,i:number)=>(
                    <tr key={l.key} style={{opacity: selected.has(l.key)?1:0.45}}>
                      <td><input type="checkbox" checked={selected.has(l.key)} onChange={()=>toggle(l.key)} /></td>
                      <td><div style={{fontWeight:500}}>{l.product.title}</div><div style={{fontSize:11, color:'hsl(0,0%,47%)'}}>{l.size?`Size ${l.size} • `:''}{l.product.category}</div></td>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:6}}>
                          <button onClick={()=>updateQty(l.key,-1)} style={{width:24,height:24,border:'1px solid hsl(0,0%,93%)',borderRadius:4,background:'#fff'}}>-</button>
                          <span style={{minWidth:20,textAlign:'center'}}>{l.qty}</span>
                          <button onClick={()=>updateQty(l.key,1)} style={{width:24,height:24,border:'1px solid hsl(0,0%,93%)',borderRadius:4,background:'#fff'}}>+</button>
                        </div>
                      </td>
                      <td>Rs. {l.lineTotal.toLocaleString('en-IN')}</td>
                      <td><button onClick={()=>removeItem(l.key)} style={{fontSize:11,color:'hsl(0,84%,60%)',border:'none',background:'none',cursor:'pointer'}}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:10, padding:18, height:'fit-content', position:'sticky', top:20}}>
              <h3 style={{fontWeight:600, marginBottom:12}}>Order summary</h3>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid hsl(0,0%,93%)'}}><span>Subtotal ({selectedDetailed.length} selected)</span><span>Rs. {subtotal.toLocaleString('en-IN')}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid hsl(0,0%,93%)'}}><span>Delivery</span><span>{delivery?`Rs. ${delivery.toLocaleString('en-IN')}`:'—'}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', fontWeight:700}}><span>Total</span><span>Rs. {total.toLocaleString('en-IN')}</span></div>
              <a href={selectedDetailed.length?`/checkout?selected=${encodeURIComponent(JSON.stringify(items.filter((l:any)=> selected.has(`${l.id}::${l.size||''}`))))}`:'/checkout'} className="banner-btn" style={{width:'100%', marginTop:12, padding:'12px', display:'block', textAlign:'center', background: selectedDetailed.length?'hsl(0,0%,13%)':'hsl(0,0%,93%)', color: selectedDetailed.length?'#fff':'hsl(0,0%,47%)', borderRadius:6, pointerEvents: selectedDetailed.length?'auto':'none'}}>Proceed to Checkout {selectedDetailed.length?`(${selectedDetailed.length})`:''}</a>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:8, textAlign:'center'}}>eSewa • Khalti • Nepal — only checked items will be ordered</p>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
