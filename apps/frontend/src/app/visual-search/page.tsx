// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function VisualSearchPage(){
  const [results,setResults]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState<string | null>(null);

  const onFile=async(e:any)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    const r=await fetch(`${API}/api/spotlight/visual-search`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ imageName: file.name, categoryHint: file.name.split('.')[0] })
    });
    const data=await r.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <h1 className="title">Visual Search <span style={{fontWeight:400, fontSize:14, color:'hsl(0,0%,47%)'}}>— upload a photo, find similar</span></h1>
        <Card>
          <CardHeader><CardTitle className="text-sm">Upload Image (CLIP mock)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept="image/*" onChange={onFile}/>
            {preview && <img src={preview} alt="preview" style={{width:160, height:160, objectFit:'cover', borderRadius:10, border:'1px solid hsl(0,0%,93%)'}}/>}
            {loading && <p className="text-sm text-muted-foreground">Searching with CLIP embeddings...</p>}
          </CardContent>
        </Card>

        {results.length>0 && (
          <div style={{marginTop:24}}>
            <h2 className="title">Similar Products <span style={{fontSize:12, color:'hsl(0,0%,47%)'}}>{results.length} matches • pgvector</span></h2>
            <div className="product-grid">
              {results.map((r:any)=>(
                <div key={r.product.id} className="showcase">
                  <div className="showcase-banner">
                    <img src={r.product.images?.[0]} alt={r.product.title} width={300} className="product-img default"/>
                    <p className="showcase-badge" style={{background:'hsl(152,51%,52%)'}}>{(r.score*100).toFixed(1)}% match</p>
                  </div>
                  <div className="showcase-content">
                    <span className="showcase-category">{r.product.category}</span>
                    <Link href={`/product/${r.product.slug}`}><h3 className="showcase-title">{r.product.title}</h3></Link>
                    <div className="price-box"><p className="price">Rs. {Number(r.product.price).toLocaleString('en-IN')}</p></div>
                    <Link href={`/product/${r.product.slug}`} className="banner-btn" style={{marginTop:8, display:'inline-block', fontSize:12, padding:'6px 12px'}}>View</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}
