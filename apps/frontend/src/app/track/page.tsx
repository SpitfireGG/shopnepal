// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useState } from 'react';

export default function TrackPage(){
  const [uuid,setUuid]=useState('');
  const [data,setData]=useState<any>(null);
  const [err,setErr]=useState('');
  const go=async(e:any)=>{
    e.preventDefault(); setErr(''); setData(null);
    const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000') + `/api/track/${encodeURIComponent(uuid.trim())}`);
    const j=await r.json(); if(j.error) setErr(j.error); else setData(j);
  };
  return (
    <>
      <Header/>
      <main style={{maxWidth:640, margin:'0 auto', padding:'30px 15px 60px'}}>
        <h1 className="title">Track your order</h1>
        <form onSubmit={go} style={{display:'flex', gap:10, margin:'16px 0'}}>
          <input value={uuid} onChange={e=>setUuid(e.target.value)} placeholder="Paste order ID (SHOPNEPAL-...)" style={{flex:1, height:44, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
          <button className="banner-btn" type="submit" style={{padding:'0 18px'}}>Track</button>
        </form>
        {err && <p style={{color:'hsl(0,100%,70%)'}}>{err}</p>}
        {data && (
          <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:10, padding:18}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><strong>#{data.order.orderNumber}</strong><span style={{padding:'4px 8px', border:'1px solid hsl(0,0%,93%)', borderRadius:20, fontSize:12}}>{data.order.status}</span></div>
            <div style={{display:'flex', gap:8, margin:'16px 0'}}>
              {data.steps.map((s:any,i:number)=><div key={i} style={{flex:1, textAlign:'center', padding:'10px 6px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, fontSize:12, background: s.done ? 'hsla(152,51%,52%,.15)' : '#fff', borderColor: s.done ? 'hsl(152,51%,52%)' : 'hsl(0,0%,93%)'}}>{s.status}</div>)}
            </div>
            <p style={{fontSize:12, color:'hsl(0,0%,47%)'}}>Payment: {data.order.paymentStatus} • Created {new Date(data.order.createdAt).toLocaleDateString()}</p>
            <a href={`/invoice/${data.order.transactionUuid}`} style={{color:'hsl(353,100%,78%)'}}>View invoice</a>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
