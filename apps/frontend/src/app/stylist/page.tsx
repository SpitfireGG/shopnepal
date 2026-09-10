// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <h1 className="title">AI Stylist <Badge>Outfit Graph</Badge></h1>
        <p style={{color:'hsl(0,0%,47%)', fontSize:13, marginTop:-20, marginBottom:16}}>Complete the look — LLM + product embeddings • 10% bundle discount</p>
        <div style={{display:'flex', gap:8, marginBottom:16}}>
          {['casual','formal','festive'].map(s=>(
            <Button key={s} variant={style===s?'default':'outline'} onClick={()=>{ setStyle(s); load(s); }}>{s}</Button>
          ))}
        </div>
        {loading ? <p style={{padding:40, textAlign:'center'}}>Styling...</p> : bundle && (
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
            <div>
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
            </div>
            <Card>
              <CardHeader><CardTitle className="text-sm">Bundle Summary • {bundle.style}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {bundle.bundle.map((p:any)=><div key={p.id} style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span>{p.title}</span><span>Rs. {p.price.toLocaleString('en-IN')}</span></div>)}
                <div style={{borderTop:'1px solid hsl(0,0%,93%)', paddingTop:8, marginTop:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span>Total</span><span>Rs. {bundle.total.toLocaleString('en-IN')}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, color:'hsl(152,51%,52%)'}}><span>Bundle -10%</span><span>- Rs. {bundle.discount.toLocaleString('en-IN')}</span></div>
                  <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, paddingTop:6}}><span>Final</span><span>Rs. {bundle.finalTotal.toLocaleString('en-IN')}</span></div>
                </div>
                <Button className="w-full" style={{marginTop:12}}>Add Bundle to Bag</Button>
                <p style={{fontSize:11, color:'hsl(0,0%,47%)', textAlign:'center'}}>eSewa • Khalti • ShopNepal</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
