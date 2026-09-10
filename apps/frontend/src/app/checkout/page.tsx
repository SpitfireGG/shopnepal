// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CheckoutPage(){
  const [items,setItems]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const [form,setForm]=useState({ name:'', email:'', phone:'9800000000', address:'', city:'Lalitpur', method:'esewa' });
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const selParam=params.get('selected');
    let raw:any[]=[];
    if(selParam){
      try{
        let s=selParam;
        try{ s=decodeURIComponent(s); }catch{}
        raw=JSON.parse(s);
        if(!Array.isArray(raw)) raw=[raw];
      }catch{
        try{ raw=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]'); }catch{ raw=[]; }
      }
    } else {
      try{ raw=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]'); }catch{ raw=[]; }
    }
    if(!Array.isArray(raw)) raw=[];
    setItems(raw);
    setSelected(new Set(raw.map((l:any)=>`${l.id}::${l.size||''}`)));
    fetch(`${API}/api/products`).then(r=>r.json()).then(setProducts).catch(()=>{});
  },[]);

  const [productsLoaded,setProductsLoaded]=useState(false);
  useEffect(()=>{ if(products.length) setProductsLoaded(true); },[products]);
  const detailed=items.map((l:any)=>{
    const p=products.find((pp:any)=>pp.id===l.id);
    return p ? { ...l, product:p, lineTotal: p.price*l.qty, key:`${l.id}::${l.size||''}` } : null;
  }).filter(Boolean);
  const isLoadingProducts=items.length>0 && !productsLoaded && detailed.length===0;
  const selectedDetailed=detailed.filter((l:any)=> selected.has(l.key));
  const subtotal=selectedDetailed.reduce((s:any,l:any)=>s+l.lineTotal,0);
  const delivery=selectedDetailed.length?100:0;
  const total=subtotal+delivery;
  const toggle=(k:string)=>{ const ns=new Set(selected); if(ns.has(k)) ns.delete(k); else ns.add(k); setSelected(ns); };
  const toggleAll=()=>{ if(selected.size===items.length) setSelected(new Set()); else setSelected(new Set(items.map((l:any)=>`${l.id}::${l.size||''}`))); };

  const pay=async()=>{
    if(selectedDetailed.length===0){ setError('Select at least one item to checkout'); return; }
    if(!form.name || !form.phone || !form.address){ setError('Name, phone, address required'); return; }
    if(!/^98\d{8}$/.test(form.phone)){ setError('Phone must be 98XXXXXXXX (Nepal)'); return; }
    setLoading(true); setError('');
    try{
      const payloadItems=selectedDetailed.map((l:any)=>({ id:l.id, qty:l.qty, size:l.size }));
      const r=await fetch(`${API}/api/checkout`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ items: payloadItems, ...form })
      });
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||data.message||'Checkout failed');
      const remaining=items.filter((l:any)=> !selected.has(`${l.id}::${l.size||''}`));
      localStorage.setItem('shopnepal.cart.v1', JSON.stringify(remaining));
      window.dispatchEvent(new Event('shopnepal:cart-changed'));
      if(data.redirectUrl){
        const url=data.redirectUrl.startsWith('http')?data.redirectUrl: data.redirectUrl.startsWith('/')? `${API}${data.redirectUrl}`: data.redirectUrl;
        window.location.href=url;
      } else if(data.action){
        const f=document.createElement('form');
        f.method='POST'; f.action=data.action;
        Object.entries(data.fields).forEach(([k,v]:any)=>{
          const inp=document.createElement('input');
          inp.type='hidden'; inp.name=k; inp.value=String(v);
          f.appendChild(inp);
        });
        document.body.appendChild(f); f.submit();
      } else {
        window.location.href=`/invoice/${data.transactionUuid}`;
      }
    }catch(e:any){ setError(e.message); setLoading(false); }
  };

  if(items.length===0) return (
    <><Header/><main className="container" style={{padding:'40px 15px', textAlign:'center', maxWidth:820, margin:'0 auto'}}><h1 className="title">Checkout</h1><p>Your bag is empty. <a href="/" style={{color:'hsl(353,100%,78%)'}}>Shop now</a></p></main><Footer/></>
  );
  if(isLoadingProducts) return (
    <><Header/><main className="container" style={{padding:'40px 15px', textAlign:'center', maxWidth:820, margin:'0 auto'}}><h1 className="title">Checkout</h1><p>Loading your selected items…</p></main><Footer/></>
  );
  if(detailed.length===0) return (
    <><Header/><main className="container" style={{padding:'40px 15px', textAlign:'center', maxWidth:820, margin:'0 auto'}}><h1 className="title">Checkout</h1><p>Selected items not found. <a href="/cart" style={{color:'hsl(353,100%,78%)'}}>Back to bag</a></p><p style={{fontSize:12, color:'hsl(0,0%,47%)', marginTop:8}}>Tried: {items.map((x:any)=>x.id).join(', ')}</p></main><Footer/></>
  );

  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <h1 className="title">Checkout — Nepal</h1>
        <p style={{fontSize:12, color:'hsl(0,0%,47%)', marginBottom:12}}>Only checked items will be ordered. Uncheck to exclude.</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:24}}>
          <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <h3 style={{fontWeight:600}}>Select items ({selected.size}/{detailed.length})</h3>
              <label style={{fontSize:12, display:'flex', alignItems:'center', gap:6, cursor:'pointer'}}><input type="checkbox" checked={selected.size===detailed.length} onChange={toggleAll}/> Select all</label>
            </div>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:8, overflow:'hidden', marginBottom:18}}>
              {detailed.map((l:any)=>(
                <label key={l.key} style={{display:'flex', gap:12, padding:'10px 12px', borderBottom:'1px solid hsl(0,0%,93%)', background: selected.has(l.key)?'#fff':'hsl(0,0%,98%)', opacity: selected.has(l.key)?1:0.6, cursor:'pointer'}}>
                  <input type="checkbox" checked={selected.has(l.key)} onChange={()=>toggle(l.key)} style={{marginTop:4}}/>
                  <img src={l.product.images?.[0]} alt={l.product.title} style={{width:48,height:48,objectFit:'cover',borderRadius:6,border:'1px solid hsl(0,0%,93%)'}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500, fontSize:13}}>{l.product.title} {l.size?`(${l.size})`:''}</div>
                    <div style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Qty {l.qty} • Rs. {l.lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{fontSize:12, fontWeight:600}}>Rs. {l.lineTotal.toLocaleString('en-IN')}</div>
                </label>
              ))}
            </div>
            <h3 style={{fontWeight:600, marginBottom:12}}>Delivery details</h3>
            <div style={{display:'grid', gap:12}}>
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full name *" style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone 98XXXXXXXX *" style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
                <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
              </div>
              <input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Address (Ward, Tole) *" style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
              <input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} placeholder="City" style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
              <div style={{display:'flex', gap:10, marginTop:6}}>
                {['esewa','khalti','dummy'].map(m=>(
                  <label key={m} style={{flex:1, padding:'10px', border:'1px solid', borderColor: form.method===m ? 'hsl(0,0%,13%)' : 'hsl(0,0%,93%)', borderRadius:8, background: form.method===m ? 'hsl(0,0%,13%)' : '#fff', color: form.method===m ? '#fff' : '#000', textAlign:'center', cursor:'pointer', fontSize:12, textTransform:'capitalize'}}>
                    <input type="radio" name="method" value={m} checked={form.method===m} onChange={()=>setForm({...form, method:m})} style={{display:'none'}}/>
                    {m}
                  </label>
                ))}
              </div>
              {error && <p style={{color:'hsl(0,84%,60%)', fontSize:12}}>{error}</p>}
            </div>
          </div>

          <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', padding:18, height:'fit-content', position:'sticky', top:20}}>
            <h3 style={{fontWeight:600, marginBottom:12}}>Order summary</h3>
            <div style={{fontSize:13, maxHeight:200, overflow:'auto', borderBottom:'1px solid hsl(0,0%,93%)', paddingBottom:12, marginBottom:12}}>
              {selectedDetailed.length? selectedDetailed.map((l:any,i:number)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0'}}>
                  <span>{l.product.title} × {l.qty}</span><span>Rs. {l.lineTotal.toLocaleString('en-IN')}</span>
                </div>
              )): <p style={{fontSize:12, color:'hsl(0,0%,47%)', textAlign:'center', padding:20}}>No items selected</p>}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13}}><span>Subtotal ({selectedDetailed.length})</span><span>Rs. {subtotal.toLocaleString('en-IN')}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13}}><span>Delivery</span><span>{delivery?`Rs. ${delivery.toLocaleString('en-IN')}`:'—'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', fontWeight:700, borderTop:'1px solid hsl(0,0%,93%)'}}><span>Total</span><span>Rs. {total.toLocaleString('en-IN')}</span></div>
            <button onClick={pay} disabled={loading || selectedDetailed.length===0} style={{width:'100%', marginTop:12, padding:'12px', background: loading || selectedDetailed.length===0 ? 'hsl(0,0%,70%)' : 'hsl(0,0%,13%)', color:'#fff', borderRadius:8}}>{loading ? 'Processing...' : `Pay now ${selectedDetailed.length?`(${selectedDetailed.length} items)`:''}`}</button>
            <p style={{fontSize:11, color:'hsl(0,0%,47%)', textAlign:'center', marginTop:8}}>Only checked items will be ordered • eSewa • Khalti • Secure</p>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
