// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StylistPage(){
  const [style,setStyle]=useState('casual');
  const [bundle,setBundle]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const load=async(s:string)=>{
    setLoading(true);
    const r=await fetch(`${API}/api/spotlight/stylist?style=${encodeURIComponent(s)}`);
    const data=await r.json();
    setBundle(data);
    setLoading(false);
  };
  useEffect(()=>{ load(style); },[]);
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:20}}>
          <h1 className="title" style={{marginBottom:6}}>AI Stylist</h1>
          <p style={{color:'hsl(0,0%,47%)', fontSize:13}}>Complete the look — outfit graph • 10% bundle discount</p>
        </div>
        <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:20}}>
          {['casual','formal','festive'].map(s=>(
            <button key={s} onClick={()=>{ setStyle(s); load(s); }} style={{padding:'8px 18px', borderRadius:20, border:'1px solid', borderColor: style===s ? 'hsl(0,0%,13%)' : 'hsl(0,0%,93%)', background: style===s ? 'hsl(0,0%,13%)' : '#fff', color: style===s ? '#fff' : 'hsl(0,0%,47%)', fontSize:13, textTransform:'capitalize'}}>{s}</button>
          ))}
        </div>
        {loading ? <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>Styling your outfit...</p> : bundle && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
            <div className="product-grid">
              {bundle.bundle.map((p:any)=>(
                <div key={p.id} className="showcase">
                  <div className="showcase-banner"><img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/></div>
                  <div className="showcase-content">
                    <span className="showcase-category">{p.category}</span>
                    <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                    <div className="price-box"><p className="price">Rs. {Number(p.price).toLocaleString('en-IN')}</p></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', padding:18, height:'fit-content'}}>
              <h3 style={{fontWeight:600, marginBottom:12, textTransform:'capitalize'}}>{bundle.style} Bundle</h3>
              <div style={{fontSize:13}}>
                {bundle.bundle.map((p:any)=><div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid hsl(0,0%,98%)'}}><span style={{color:'hsl(0,0%,47%)'}}>{p.title}</span><span>Rs. {p.price.toLocaleString('en-IN')}</span></div>)}
                <div style={{marginTop:12, paddingTop:12, borderTop:'1px solid hsl(0,0%,93%)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span style={{color:'hsl(0,0%,47%)'}}>Total</span><span>Rs. {bundle.total.toLocaleString('en-IN')}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'hsl(152,51%,52%)'}}><span>Bundle -10%</span><span>- Rs. {bundle.discount.toLocaleString('en-IN')}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, paddingTop:8, marginTop:8, borderTop:'1px dashed hsl(0,0%,93%)'}}><span>Final</span><span>Rs. {bundle.finalTotal.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
              <button style={{width:'100%', marginTop:16, padding:'12px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:8, fontSize:13}}>Add Bundle to Bag</button>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', textAlign:'center', marginTop:8}}>eSewa • Khalti • ShopNepal</p>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
