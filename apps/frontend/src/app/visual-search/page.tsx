// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useState } from 'react';
import Link from 'next/link';

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
        <div style={{textAlign:'center', marginBottom:24}}>
          <h1 className="title" style={{marginBottom:6}}>Visual Search</h1>
          <p style={{color:'hsl(0,0%,47%)', fontSize:13}}>Upload a photo — CLIP finds similar products • pgvector</p>
        </div>

        <div style={{maxWidth:520, margin:'0 auto', border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', padding:20}}>
          <p style={{fontSize:12, fontWeight:600, letterSpacing:1, color:'hsl(0,0%,47%)', marginBottom:12}}>UPLOAD IMAGE</p>
          <label style={{display:'block', border:'2px dashed hsl(0,0%,93%)', borderRadius:10, padding:24, textAlign:'center', cursor:'pointer', background:'hsl(0,0%,98%)'}}>
            <input type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/>
            <div style={{fontSize:28, marginBottom:6}}>📷</div>
            <div style={{fontSize:13, fontWeight:600}}>Click to upload</div>
            <div style={{fontSize:11, color:'hsl(0,0%,47%)'}}>JPG, PNG • e.g., jacket.jpg</div>
          </label>
          {preview && <div style={{marginTop:14, textAlign:'center'}}><img src={preview} alt="preview" style={{width:160, height:160, objectFit:'cover', borderRadius:10, border:'1px solid hsl(0,0%,93%)', margin:'0 auto'}}/><p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:6}}>Preview</p></div>}
          {loading && <p style={{textAlign:'center', marginTop:12, fontSize:13, color:'hsl(0,0%,47%)'}}>Searching with CLIP embeddings...</p>}
        </div>

        {results.length>0 && (
          <div style={{marginTop:32}}>
            <h2 className="title" style={{display:'flex', alignItems:'center', gap:10}}>Similar Products <span style={{fontSize:11, padding:'4px 8px', border:'1px solid hsl(152,51%,52%)', borderRadius:20, color:'hsl(152,51%,52%)', background:'hsla(152,51%,52%,.08)'}}>{results.length} matches • pgvector</span></h2>
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
                    <Link href={`/product/${r.product.slug}`} style={{marginTop:8, display:'inline-block', fontSize:12, padding:'6px 14px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:6}}>View</Link>
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
