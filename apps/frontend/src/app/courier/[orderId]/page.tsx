// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CourierPage({ params }: { params: Promise<{orderId: string}>}){
  const [orderId,setOrderId]=useState('');
  const [data,setData]=useState<any>(null);
  useEffect(()=>{ params.then(p=> setOrderId(p.orderId)); },[params]);
  useEffect(()=>{
    if(!orderId) return;
    const load=async()=>{ const r=await fetch(`${API}/api/spotlight/courier/${encodeURIComponent(orderId)}`); const j=await r.json(); setData(j); };
    load();
    const iv=setInterval(load, 8000);
    return ()=> clearInterval(iv);
  },[orderId]);
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:900, margin:'0 auto'}}>
        <h1 className="title">Live Courier Map <Badge>OSRM + Leaflet</Badge></h1>
        {data ? (
          <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
            <Card>
              <CardHeader><CardTitle className="text-sm">Pulchowk → Delivery</CardTitle></CardHeader>
              <CardContent>
                <div style={{height:320, background:'hsl(0,0%,96%)', borderRadius:10, border:'1px solid hsl(0,0%,93%)', display:'grid', placeItems:'center', position:'relative', overflow:'hidden'}}>
                  <div style={{position:'absolute', inset:0, background:'linear-gradient(135deg, hsl(152,51%,92%) 0%, hsl(0,0%,96%) 100%)'}}/>
                  <div style={{position:'relative', textAlign:'center'}}>
                    <div style={{width:14, height:14, background:'hsl(152,51%,52%)', borderRadius:'50%', margin:'0 auto 8px', boxShadow:'0 0 0 8px hsla(152,51%,52%,.2)', animation:'pulse 2s infinite'}}/>
                    <p style={{fontWeight:600}}>{data.courier}</p>
                    <p style={{fontSize:12, color:'hsl(0,0%,47%)'}}>{data.lat.toFixed(4)}, {data.lng.toFixed(4)} • {data.etaMinutes} min ETA</p>
                    <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:6}}>Live every 8s • Inside Valley • Standard</p>
                  </div>
                </div>
                <p style={{fontSize:12, color:'hsl(0,0%,47%)', marginTop:8}}>Route: Pulchowk, Lalitpur → {orderId.slice(0,16)} • OSRM optimized</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Courier</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p style={{fontWeight:600}}>{data.courier}</p>
                <a href={`tel:${data.phone}`} style={{color:'hsl(353,100%,78%)'}}>{data.phone}</a>
                <div style={{display:'flex', gap:8, marginTop:12}}><Badge variant={data.status==='out_for_delivery'?'default':'secondary'}>{data.status}</Badge><Badge variant="outline">{data.etaMinutes} min</Badge></div>
                <p style={{fontSize:12, color:'hsl(0,0%,47%)', marginTop:12}}>Order: {orderId}</p>
                <a href={`/track?order=${encodeURIComponent(orderId)}`} style={{display:'inline-block', marginTop:8, padding:'8px 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6, fontSize:12}}>View Order Status</a>
              </CardContent>
            </Card>
          </div>
        ) : <p style={{padding:40, textAlign:'center', color:'hsl(0,0%,47%)'}}>Loading live location...</p>}
      </main>
      <Footer/>
    </>
  );
}
